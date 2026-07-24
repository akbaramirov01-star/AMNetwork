// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AM Zakat Pool
 * @notice Blockchain-verified Zakat & Sadaqah distribution for AM Network.
 *
 *  SHARIA MODEL — Wakala bil Ujrah (agency for a fee):
 *   - The donor's full Zakat (100%) reaches the recipient. NOTHING is taken
 *     from the Zakat principal.
 *   - The platform's service fee (ujrah) is charged ON TOP of the Zakat and
 *     routed to the treasury. This avoids the fiqh objection of "taking from
 *     the share of the poor."
 *   - Settlement uses a STABLECOIN (e.g. USDC on Base) — no speculative token,
 *     so there is no gharar/maysir on the value transferred.
 *
 *  FLOW:
 *   1. Oracle (verified mosque imam / NGO / AM volunteer) registers a recipient
 *      with their AI eligibility score (0–100) and Asnaf category (1–8).
 *   2. Donor calls donate() — pays (zakatAmount + ujrah). Zakat goes to escrow,
 *      ujrah goes to treasury.
 *   3. Funds sit in escrow allocated to the recipient.
 *   4. An oracle confirms physical delivery / presence → release() transfers
 *      the full Zakat to the recipient.
 *
 *  Every step emits an event → that IS the public, auditable blockchain ledger.
 *
 *  @dev THIS IS A PROTOTYPE. Do NOT deploy to mainnet without:
 *       - a professional security audit,
 *       - sign-off from the Sharia advisory board on the ujrah mechanics,
 *       - a multisig (e.g. Gnosis Safe) holding ADMIN_ROLE.
 */
contract AMZakatPool is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ─── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // ─── Config ─────────────────────────────────────────────────────────────--
    IERC20  public immutable stablecoin;   // settlement asset (e.g. USDC)
    address public treasury;               // receives ujrah (service fee)

    // Ujrah is expressed in basis points (1% = 100 bps) and is TIERED so that
    // larger donations pay a lower service rate. Charged on top of the Zakat.
    // Tiers are configurable by ADMIN within a hard cap so the fee can never
    // become exploitative.
    uint16 public constant MAX_UJRAH_BPS = 250;  // hard ceiling = 2.5%

    struct UjrahTier {
        uint256 minAmount;  // donation ≥ this (in stablecoin smallest unit)
        uint16  bps;        // fee in basis points
    }
    UjrahTier[] public ujrahTiers;          // sorted ascending by minAmount

    // ─── Recipients ─────────────────────────────────────────────────────────--
    struct Recipient {
        bool    registered;
        uint8   score;       // AI eligibility score 0–100
        uint8   category;    // Asnaf category 1–8
        address oracle;      // who registered/verified
        uint256 escrow;      // Zakat currently held for this recipient
        uint256 received;    // lifetime Zakat released to this recipient
    }
    mapping(address => Recipient) public recipients;

    // ─── Accounting ─────────────────────────────────────────────────────────--
    uint256 public totalEscrow;     // sum of all unreleased Zakat
    uint256 public totalDistributed;
    uint256 public totalUjrah;

    // ─── Events (the public ledger) ───────────────────────────────────────────
    event RecipientRegistered(address indexed recipient, uint8 score, uint8 category, address indexed oracle);
    event RecipientScoreUpdated(address indexed recipient, uint8 oldScore, uint8 newScore, address indexed oracle);
    event Donated(address indexed donor, address indexed recipient, uint256 zakat, uint256 ujrah);
    event Released(address indexed recipient, uint256 amount, address indexed oracle);
    event UjrahTiersUpdated(uint256 tierCount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    // ─── Constructor ────────────────────────────────────────────────────────--
    constructor(address _stablecoin, address _treasury, address _admin) {
        require(_stablecoin != address(0) && _treasury != address(0) && _admin != address(0), "zero addr");
        stablecoin = IERC20(_stablecoin);
        treasury   = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);

        // Sensible default tiers (assuming a 6-decimal stablecoin like USDC):
        //   < $1,000      → 2.5%
        //   $1k – $10k    → 1.5%
        //   ≥ $10,000     → 1.0%
        ujrahTiers.push(UjrahTier({minAmount: 0,            bps: 250}));
        ujrahTiers.push(UjrahTier({minAmount: 1_000e6,      bps: 150}));
        ujrahTiers.push(UjrahTier({minAmount: 10_000e6,     bps: 100}));
    }

    // ─── Oracle: recipient management ─────────────────────────────────────────
    function registerRecipient(address recipient, uint8 score, uint8 category)
        external onlyRole(ORACLE_ROLE) whenNotPaused
    {
        require(recipient != address(0), "zero addr");
        require(!recipients[recipient].registered, "already registered");
        require(score <= 100, "score>100");
        require(category >= 1 && category <= 8, "bad category");

        recipients[recipient] = Recipient({
            registered: true,
            score:      score,
            category:   category,
            oracle:     msg.sender,
            escrow:     0,
            received:   0
        });
        emit RecipientRegistered(recipient, score, category, msg.sender);
    }

    function updateScore(address recipient, uint8 newScore)
        external onlyRole(ORACLE_ROLE) whenNotPaused
    {
        Recipient storage r = recipients[recipient];
        require(r.registered, "not registered");
        require(newScore <= 100, "score>100");
        uint8 old = r.score;
        r.score = newScore;
        emit RecipientScoreUpdated(recipient, old, newScore, msg.sender);
    }

    // ─── Donor: give Zakat (directed to a specific verified recipient) ─────────
    /**
     * @param recipient   the verified recipient
     * @param zakatAmount the Zakat the donor wishes to give (reaches recipient in full)
     * @param maxUjrah    the highest service fee the donor accepts, in stablecoin
     *                    units. Pass the exact figure your UI showed the donor
     *                    (`quoteUjrah`), optionally plus a small tolerance.
     * @dev Donor must approve (zakatAmount + ujrah) of the stablecoin first.
     *
     *      maxUjrah is REQUIRED, not optional: the fee is read from live tier
     *      storage at execution time, so without a bound an ADMIN_ROLE tier
     *      change landing before this transaction mines would silently charge
     *      the donor more than they agreed to (up to MAX_UJRAH_BPS). Donors
     *      commonly grant an infinite ERC20 allowance, so there is no
     *      allowance ceiling to protect them either.
     */
    function donate(address recipient, uint256 zakatAmount, uint256 maxUjrah)
        external nonReentrant whenNotPaused
    {
        require(zakatAmount > 0, "zero amount");
        Recipient storage r = recipients[recipient];
        require(r.registered, "recipient not verified");

        uint256 ujrah = quoteUjrah(zakatAmount);
        require(ujrah <= maxUjrah, "ujrah exceeds maxUjrah");

        // Pull Zakat into escrow and ujrah to treasury in two safe transfers.
        stablecoin.safeTransferFrom(msg.sender, address(this), zakatAmount);
        if (ujrah > 0) {
            stablecoin.safeTransferFrom(msg.sender, treasury, ujrah);
            totalUjrah += ujrah;
        }

        r.escrow    += zakatAmount;
        totalEscrow += zakatAmount;

        emit Donated(msg.sender, recipient, zakatAmount, ujrah);
    }

    // ─── Oracle: release escrowed Zakat after confirming delivery ──────────────
    function release(address recipient, uint256 amount)
        external onlyRole(ORACLE_ROLE) nonReentrant whenNotPaused
    {
        Recipient storage r = recipients[recipient];
        require(r.registered, "not registered");
        require(amount > 0 && amount <= r.escrow, "bad amount");

        r.escrow         -= amount;
        totalEscrow      -= amount;
        r.received       += amount;
        totalDistributed += amount;

        stablecoin.safeTransfer(recipient, amount);
        emit Released(recipient, amount, msg.sender);
    }

    // ─── Views ──────────────────────────────────────────────────────────────--
    /// @notice Returns the ujrah (service fee) for a given Zakat amount.
    function quoteUjrah(uint256 zakatAmount) public view returns (uint256) {
        uint16 bps = ujrahTiers[0].bps;
        for (uint256 i = 0; i < ujrahTiers.length; i++) {
            if (zakatAmount >= ujrahTiers[i].minAmount) {
                bps = ujrahTiers[i].bps;
            }
        }
        return (zakatAmount * bps) / 10_000;
    }

    // ─── Admin ────────────────────────────────────────────────────────────---
    function setUjrahTiers(UjrahTier[] calldata tiers) external onlyRole(ADMIN_ROLE) {
        require(tiers.length > 0, "empty");
        require(tiers[0].minAmount == 0, "first tier must start at 0");
        delete ujrahTiers;
        for (uint256 i = 0; i < tiers.length; i++) {
            require(tiers[i].bps <= MAX_UJRAH_BPS, "ujrah > cap");
            if (i > 0) require(tiers[i].minAmount > tiers[i - 1].minAmount, "tiers not ascending");
            ujrahTiers.push(tiers[i]);
        }
        emit UjrahTiersUpdated(tiers.length);
    }

    function setTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        require(newTreasury != address(0), "zero addr");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function addOracle(address oracle)    external onlyRole(ADMIN_ROLE) { _grantRole(ORACLE_ROLE, oracle); }
    function removeOracle(address oracle) external onlyRole(ADMIN_ROLE) { _revokeRole(ORACLE_ROLE, oracle); }

    function pause()   external onlyRole(ADMIN_ROLE) { _pause();   }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}
