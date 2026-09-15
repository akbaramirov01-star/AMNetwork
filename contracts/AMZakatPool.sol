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
 *   4. An oracle confirms physical delivery / presence → requestRelease().
 *      A second, distinct oracle → confirmRelease() on the same request.
 *      Only once releaseThreshold oracles agree does the transfer execute —
 *      no single oracle can move a recipient's escrow alone.
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

    // ─── Release requests ───────────────────────────────────────────────────--
    // A single ORACLE_ROLE key confirming "delivery happened" and immediately
    // moving that recipient's whole escrow was the gap flagged going into a
    // security audit: one phished or dishonest oracle (or an oracle colluding
    // with a recipient address they control) could fabricate a delivery and
    // drain that recipient's escrow with no second check. requestRelease() /
    // confirmRelease() require `releaseThreshold` DISTINCT oracles to agree
    // before funds move — see README "Known issues".
    uint8 public releaseThreshold = 2;

    struct ReleaseRequest {
        address recipient;
        uint256 amount;
        uint256 confirmations;
        bool    executed;
    }
    uint256 public releaseRequestCount;
    mapping(uint256 => ReleaseRequest) public releaseRequests;
    mapping(uint256 => mapping(address => bool)) public releaseConfirmedBy;
    mapping(uint256 => bool) public releaseDisputed;

    // ─── Oracle staking & reputation ───────────────────────────────────────────
    // releaseThreshold (≥2 distinct confirmations) already rules out ONE
    // compromised oracle draining a recipient's escrow alone. What it doesn't
    // stop: the same dishonest oracle (or a colluding pair) doing this
    // repeatedly across many different recipients before anyone notices —
    // flagged going into a security audit alongside the single-oracle gap.
    //
    // A refundable stake gives every oracle something real to lose. A
    // per-period release cap bounds how much damage a new, unproven oracle
    // can do before earning more trust (raised per-oracle by ADMIN_ROLE as
    // their track record grows). Strikes/slashing give ADMIN_ROLE — in
    // practice the Sharia/ops review board, acting on an investigated report
    // — a way to act on confirmed fraud.
    //
    // What this deliberately does NOT do: reverse a specific past transfer.
    // Zakat already physically handed to a recipient can't be clawed back
    // on-chain, so the real protection here is removing a bad oracle from
    // FUTURE cases and making dishonesty costly, not undoing the past.
    //
    // Random re-audits of already-executed releases are intentionally kept
    // as an ADMIN_ROLE-flagged, off-chain-selected process (flagForAudit)
    // rather than on-chain verifiable randomness (e.g. Chainlink VRF): at
    // this stage that would add an external dependency and per-request cost
    // the prototype doesn't need yet. The selection can move on-chain later
    // without changing anything else here.
    uint256 public minOracleStake;     // 0 = staking not yet required (prototype default)
    uint256 public defaultReleaseCap;  // starting per-period cap for a newly added oracle
    uint256 public constant CAP_PERIOD = 30 days;
    uint32  public constant MAX_STRIKES = 2; // a 3rd confirmed strike auto-revokes ORACLE_ROLE

    struct OracleInfo {
        uint256 stake;
        uint32  strikes;
        uint256 releaseCap;        // max release volume this oracle can confirm per period; 0 = unlimited
        uint256 releasedInPeriod;
        uint256 periodStart;
    }
    mapping(address => OracleInfo) public oracleInfo;

    // ─── Events (the public ledger) ───────────────────────────────────────────
    event RecipientRegistered(address indexed recipient, uint8 score, uint8 category, address indexed oracle);
    event RecipientScoreUpdated(address indexed recipient, uint8 oldScore, uint8 newScore, address indexed oracle);
    event Donated(address indexed donor, address indexed recipient, uint256 zakat, uint256 ujrah);
    event ReleaseRequested(uint256 indexed requestId, address indexed recipient, uint256 amount, address indexed oracle);
    event ReleaseConfirmed(uint256 indexed requestId, address indexed oracle, uint256 confirmations);
    event Released(address indexed recipient, uint256 amount, address indexed oracle);
    event UjrahTiersUpdated(uint256 tierCount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ReleaseThresholdUpdated(uint8 oldThreshold, uint8 newThreshold);
    event OracleStaked(address indexed oracle, uint256 amount, uint256 totalStake);
    event OracleUnstaked(address indexed oracle, uint256 amount, uint256 totalStake);
    event OracleSlashed(address indexed oracle, uint256 amount, uint32 strikes, string reason);
    event OracleReleaseCapUpdated(address indexed oracle, uint256 newCap);
    event MinOracleStakeUpdated(uint256 newMinStake);
    event ReleaseFlaggedForAudit(uint256 indexed requestId, address indexed flaggedBy, string reason);

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

    modifier oracleStaked() {
        require(oracleInfo[msg.sender].stake >= minOracleStake, "oracle stake below minimum");
        _;
    }

    // ─── Oracle: recipient management ─────────────────────────────────────────
    function registerRecipient(address recipient, uint8 score, uint8 category)
        external onlyRole(ORACLE_ROLE) whenNotPaused oracleStaked
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
        external onlyRole(ORACLE_ROLE) whenNotPaused oracleStaked
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
    // Two-step by design: one oracle proposes (which also counts as its own
    // confirmation), and `releaseThreshold` DISTINCT oracles in total must
    // confirm before the transfer executes. See the note on ReleaseRequest.
    function requestRelease(address recipient, uint256 amount)
        external onlyRole(ORACLE_ROLE) whenNotPaused oracleStaked returns (uint256 requestId)
    {
        Recipient storage r = recipients[recipient];
        require(r.registered, "not registered");
        require(amount > 0 && amount <= r.escrow, "bad amount");

        requestId = releaseRequestCount++;
        releaseRequests[requestId] = ReleaseRequest({
            recipient:     recipient,
            amount:        amount,
            confirmations: 0,
            executed:      false
        });
        emit ReleaseRequested(requestId, recipient, amount, msg.sender);

        _confirmRelease(requestId, msg.sender);
    }

    function confirmRelease(uint256 requestId) external onlyRole(ORACLE_ROLE) whenNotPaused oracleStaked {
        _confirmRelease(requestId, msg.sender);
    }

    function _confirmRelease(uint256 requestId, address oracle) internal nonReentrant {
        ReleaseRequest storage req = releaseRequests[requestId];
        require(req.recipient != address(0), "no such request");
        require(!req.executed, "already executed");
        require(!releaseConfirmedBy[requestId][oracle], "already confirmed");

        _consumeReleaseCap(oracle, req.amount);

        releaseConfirmedBy[requestId][oracle] = true;
        req.confirmations += 1;
        emit ReleaseConfirmed(requestId, oracle, req.confirmations);

        if (req.confirmations < releaseThreshold) return;

        Recipient storage r = recipients[req.recipient];
        require(req.amount <= r.escrow, "escrow changed since request");
        req.executed = true;

        r.escrow          -= req.amount;
        totalEscrow        -= req.amount;
        r.received         += req.amount;
        totalDistributed   += req.amount;

        stablecoin.safeTransfer(req.recipient, req.amount);
        emit Released(req.recipient, req.amount, oracle);
    }

    function _consumeReleaseCap(address oracle, uint256 amount) internal {
        OracleInfo storage o = oracleInfo[oracle];
        if (o.releaseCap == 0) return; // no cap configured for this oracle — unlimited
        if (block.timestamp >= o.periodStart + CAP_PERIOD) {
            o.periodStart = block.timestamp;
            o.releasedInPeriod = 0;
        }
        require(o.releasedInPeriod + amount <= o.releaseCap, "oracle release cap exceeded for this period");
        o.releasedInPeriod += amount;
    }

    // ─── Oracle: staking (bond against misconduct) ────────────────────────────
    // Anyone already holding ORACLE_ROLE can stake; staking itself grants no
    // extra permission, it just satisfies `oracleStaked` once minOracleStake
    // is raised above 0. Stake and role are otherwise independent: unstaking
    // never revokes the role, and losing the role never seizes the stake
    // (call unstake first, or an ADMIN_ROLE slash handles a proven case).
    function stakeAsOracle(uint256 amount) external nonReentrant whenNotPaused {
        require(hasRole(ORACLE_ROLE, msg.sender), "not an oracle");
        require(amount > 0, "zero amount");
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        OracleInfo storage o = oracleInfo[msg.sender];
        o.stake += amount;
        emit OracleStaked(msg.sender, amount, o.stake);
    }

    function unstake(uint256 amount) external nonReentrant {
        OracleInfo storage o = oracleInfo[msg.sender];
        require(amount > 0 && amount <= o.stake, "bad amount");
        o.stake -= amount;
        stablecoin.safeTransfer(msg.sender, amount);
        emit OracleUnstaked(msg.sender, amount, o.stake);
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

    function addOracle(address oracle) external onlyRole(ADMIN_ROLE) {
        _grantRole(ORACLE_ROLE, oracle);
        OracleInfo storage o = oracleInfo[oracle];
        if (o.periodStart == 0) {
            o.releaseCap   = defaultReleaseCap;
            o.periodStart  = block.timestamp;
            emit OracleReleaseCapUpdated(oracle, defaultReleaseCap);
        }
    }
    function removeOracle(address oracle) external onlyRole(ADMIN_ROLE) { _revokeRole(ORACLE_ROLE, oracle); }

    /// @notice Distinct oracle confirmations required before a release executes.
    /// @dev Keep at 1 only for local/testnet setups with a single test oracle.
    function setReleaseThreshold(uint8 newThreshold) external onlyRole(ADMIN_ROLE) {
        require(newThreshold >= 1, "threshold>=1");
        emit ReleaseThresholdUpdated(releaseThreshold, newThreshold);
        releaseThreshold = newThreshold;
    }

    /// @notice Minimum stake an oracle must hold to register recipients or
    /// confirm releases. Left at 0 (no staking enforced) until the Sharia/ops
    /// board sets a real bond amount ahead of a live deployment.
    function setMinOracleStake(uint256 newMinStake) external onlyRole(ADMIN_ROLE) {
        minOracleStake = newMinStake;
        emit MinOracleStakeUpdated(newMinStake);
    }

    /// @notice Starting per-CAP_PERIOD release cap applied to every NEWLY
    /// added oracle. 0 = unlimited from day one (prototype default).
    function setDefaultReleaseCap(uint256 newCap) external onlyRole(ADMIN_ROLE) {
        defaultReleaseCap = newCap;
    }

    /// @notice Raises (or lowers) one specific oracle's per-period release
    /// cap — e.g. as their track record grows. 0 = unlimited for this oracle.
    function setOracleReleaseCap(address oracle, uint256 newCap) external onlyRole(ADMIN_ROLE) {
        oracleInfo[oracle].releaseCap = newCap;
        emit OracleReleaseCapUpdated(oracle, newCap);
    }

    /// @notice Slashes a confirmed-fraudulent oracle's stake to the treasury
    /// and records a strike. This does NOT reverse any past transfer — Zakat
    /// already handed to a recipient can't be clawed back on-chain — it
    /// makes future misconduct costly and, past MAX_STRIKES, removes the
    /// oracle's role automatically. Intended to follow an actual off-chain
    /// investigation (the Sharia/ops review board), not to be called lightly.
    function slashOracle(address oracle, uint256 amount, string calldata reason)
        external onlyRole(ADMIN_ROLE) nonReentrant
    {
        OracleInfo storage o = oracleInfo[oracle];
        require(amount <= o.stake, "amount>stake");
        o.stake -= amount;
        o.strikes += 1;
        if (amount > 0) stablecoin.safeTransfer(treasury, amount);
        emit OracleSlashed(oracle, amount, o.strikes, reason);
        if (o.strikes > MAX_STRIKES) {
            _revokeRole(ORACLE_ROLE, oracle);
        }
    }

    /// @notice Marks an already-executed release as under audit/dispute —
    /// a permanent, public record for accountability. Selection of WHICH
    /// releases to audit is deliberately an off-chain process (e.g. the ops
    /// team sampling a random subset each period) rather than on-chain
    /// verifiable randomness: this prototype doesn't yet justify the added
    /// external dependency (e.g. Chainlink VRF) and per-request cost that
    /// would take. Purely informational — does not pause or reverse funds.
    function flagForAudit(uint256 requestId, string calldata reason) external onlyRole(ADMIN_ROLE) {
        require(releaseRequests[requestId].recipient != address(0), "no such request");
        releaseDisputed[requestId] = true;
        emit ReleaseFlaggedForAudit(requestId, msg.sender, reason);
    }

    function pause()   external onlyRole(ADMIN_ROLE) { _pause();   }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}
