// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AM Zakat Pool — General (undirected) fund
 * @notice For donors who give to the GENERAL Zakat pool rather than to a named
 *         recipient. The platform's oracle network then distributes the pooled
 *         Zakat to the highest-need verified recipients (ranked by AI score),
 *         every transfer recorded on-chain.
 *
 *  SHARIA MODEL — Wakala bil Ujrah (same as AMZakatPool):
 *   - 100% of the Zakat principal enters the pool and reaches recipients.
 *   - The ujrah (service fee) is charged ON TOP and routed to the treasury.
 *   - Stablecoin settlement — no speculative token.
 *
 *  Difference from AMZakatPool: here the donor does NOT pick a recipient. The
 *  pool is a shared balance; oracles allocate from it to verified recipients
 *  based on need. This suits donors who say "distribute my Zakat where it is
 *  needed most."
 *
 *  @dev PROTOTYPE — audit + Sharia board sign-off + multisig required before mainnet.
 */
contract AMZakatPoolGeneral is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    IERC20  public immutable stablecoin;
    address public treasury;

    uint16 public constant MAX_UJRAH_BPS = 250; // 2.5% ceiling

    struct UjrahTier { uint256 minAmount; uint16 bps; }
    UjrahTier[] public ujrahTiers;

    struct Recipient {
        bool  registered;
        uint8 score;     // AI eligibility score 0–100
        uint8 category;  // Asnaf category 1–8
        uint256 received;
    }
    mapping(address => Recipient) public recipients;

    uint256 public poolBalance;       // undirected Zakat available to distribute
    uint256 public totalDistributed;
    uint256 public totalUjrah;

    // ─── Rate limit: circuit breaker on the shared pool ───────────────────────
    // Unlike AMZakatPool, where release() can only ever move funds a donor
    // specifically routed to one recipient, here every oracle can reach the
    // whole shared poolBalance. Without a cap, one phished or rogue ORACLE_ROLE
    // key drains every donation ever made to the general pool in a single
    // transaction. This limits each oracle to a fixed amount per rolling
    // 24h window, converting instant total loss into rate-limited loss that
    // ADMIN can stop with pause() / removeOracle().
    //
    // NOT a substitute for multi-oracle consensus — see README "Known issues".
    uint256 public oracleDailyLimit;
    mapping(address => uint256) public oracleDayIndex;   // block.timestamp / 1 days
    mapping(address => uint256) public oracleSpentToday;

    event Donated(address indexed donor, uint256 zakat, uint256 ujrah);
    event RecipientRegistered(address indexed recipient, uint8 score, uint8 category, address indexed oracle);
    event Distributed(address indexed recipient, uint256 amount, uint8 score, address indexed oracle);
    event BatchDistributed(uint256 recipientCount, uint256 totalAmount, address indexed oracle);
    event OracleDailyLimitUpdated(uint256 oldLimit, uint256 newLimit);

    constructor(address _stablecoin, address _treasury, address _admin) {
        require(_stablecoin != address(0) && _treasury != address(0) && _admin != address(0), "zero addr");
        stablecoin = IERC20(_stablecoin);
        treasury   = _treasury;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);

        ujrahTiers.push(UjrahTier({minAmount: 0,        bps: 250}));
        ujrahTiers.push(UjrahTier({minAmount: 1_000e6,  bps: 150}));
        ujrahTiers.push(UjrahTier({minAmount: 10_000e6, bps: 100}));

        // Conservative default: 10,000 units (e.g. $10k USDC) per oracle per day.
        // ADMIN raises it deliberately as distribution volume grows.
        oracleDailyLimit = 10_000e6;
        emit OracleDailyLimitUpdated(0, 10_000e6);
    }

    // ─── Donor: give to the general pool ──────────────────────────────────────
    /**
     * @param zakatAmount the Zakat to add to the general pool (100% reaches recipients)
     * @param maxUjrah    highest service fee the donor accepts, in stablecoin units.
     *                    Required — see the note on AMZakatPool.donate(): the fee is
     *                    read from live tier storage, so an unbounded call can be
     *                    silently overcharged by an admin tier change that lands first.
     */
    function donate(uint256 zakatAmount, uint256 maxUjrah) external nonReentrant whenNotPaused {
        require(zakatAmount > 0, "zero amount");
        uint256 ujrah = quoteUjrah(zakatAmount);
        require(ujrah <= maxUjrah, "ujrah exceeds maxUjrah");

        stablecoin.safeTransferFrom(msg.sender, address(this), zakatAmount);
        if (ujrah > 0) {
            stablecoin.safeTransferFrom(msg.sender, treasury, ujrah);
            totalUjrah += ujrah;
        }
        poolBalance += zakatAmount;
        emit Donated(msg.sender, zakatAmount, ujrah);
    }

    // ─── Oracle: recipient management ─────────────────────────────────────────
    function registerRecipient(address recipient, uint8 score, uint8 category)
        external onlyRole(ORACLE_ROLE) whenNotPaused
    {
        require(recipient != address(0), "zero addr");
        require(!recipients[recipient].registered, "already registered");
        require(score <= 100, "score>100");
        require(category >= 1 && category <= 8, "bad category");
        recipients[recipient] = Recipient({registered: true, score: score, category: category, received: 0});
        emit RecipientRegistered(recipient, score, category, msg.sender);
    }

    // ─── Oracle: distribute from the pool to one recipient ────────────────────
    function distribute(address recipient, uint256 amount)
        external onlyRole(ORACLE_ROLE) nonReentrant whenNotPaused
    {
        _distribute(recipient, amount);
    }

    // ─── Oracle: distribute to many recipients in one transaction ─────────────
    function batchDistribute(address[] calldata to, uint256[] calldata amounts)
        external onlyRole(ORACLE_ROLE) nonReentrant whenNotPaused
    {
        require(to.length == amounts.length, "length mismatch");
        require(to.length > 0, "empty");
        uint256 sum;
        for (uint256 i = 0; i < to.length; i++) {
            _distribute(to[i], amounts[i]);
            sum += amounts[i];
        }
        emit BatchDistributed(to.length, sum, msg.sender);
    }

    /// @dev Charges `amount` against msg.sender's rolling 24h allowance.
    ///      Called on every distribution path, so batchDistribute accumulates
    ///      across its whole loop rather than resetting per recipient.
    function _consumeOracleAllowance(uint256 amount) internal {
        uint256 today = block.timestamp / 1 days;
        if (oracleDayIndex[msg.sender] != today) {
            oracleDayIndex[msg.sender] = today;
            oracleSpentToday[msg.sender] = 0;
        }
        uint256 spent = oracleSpentToday[msg.sender] + amount;
        require(spent <= oracleDailyLimit, "oracle daily limit exceeded");
        oracleSpentToday[msg.sender] = spent;
    }

    function _distribute(address recipient, uint256 amount) internal {
        Recipient storage r = recipients[recipient];
        require(r.registered, "not registered");
        require(amount > 0 && amount <= poolBalance, "exceeds pool");
        _consumeOracleAllowance(amount);

        poolBalance      -= amount;
        r.received       += amount;
        totalDistributed += amount;

        stablecoin.safeTransfer(recipient, amount);
        emit Distributed(recipient, amount, r.score, msg.sender);
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function quoteUjrah(uint256 zakatAmount) public view returns (uint256) {
        uint16 bps = ujrahTiers[0].bps;
        for (uint256 i = 0; i < ujrahTiers.length; i++) {
            if (zakatAmount >= ujrahTiers[i].minAmount) bps = ujrahTiers[i].bps;
        }
        return (zakatAmount * bps) / 10_000;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────
    function setUjrahTiers(UjrahTier[] calldata tiers) external onlyRole(ADMIN_ROLE) {
        require(tiers.length > 0 && tiers[0].minAmount == 0, "bad tiers");
        delete ujrahTiers;
        for (uint256 i = 0; i < tiers.length; i++) {
            require(tiers[i].bps <= MAX_UJRAH_BPS, "ujrah > cap");
            if (i > 0) require(tiers[i].minAmount > tiers[i - 1].minAmount, "not ascending");
            ujrahTiers.push(tiers[i]);
        }
    }

    /// @notice Remaining amount `oracle` may distribute in the current 24h window.
    function oracleRemainingToday(address oracle) external view returns (uint256) {
        if (oracleDayIndex[oracle] != block.timestamp / 1 days) return oracleDailyLimit;
        uint256 spent = oracleSpentToday[oracle];
        return spent >= oracleDailyLimit ? 0 : oracleDailyLimit - spent;
    }

    function setOracleDailyLimit(uint256 newLimit) external onlyRole(ADMIN_ROLE) {
        emit OracleDailyLimitUpdated(oracleDailyLimit, newLimit);
        oracleDailyLimit = newLimit;
    }

    function setTreasury(address t) external onlyRole(ADMIN_ROLE) { require(t != address(0), "zero"); treasury = t; }
    function addOracle(address o)    external onlyRole(ADMIN_ROLE) { _grantRole(ORACLE_ROLE, o); }
    function removeOracle(address o) external onlyRole(ADMIN_ROLE) { _revokeRole(ORACLE_ROLE, o); }
    function pause()   external onlyRole(ADMIN_ROLE) { _pause();   }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}
