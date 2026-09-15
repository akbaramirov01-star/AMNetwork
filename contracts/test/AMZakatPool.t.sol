// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../AMZakatPool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Minimal 6-decimal mock stablecoin (mimics USDC) for testing.
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract AMZakatPoolTest is Test {
    AMZakatPool pool;
    MockUSDC usdc;

    address admin     = address(0xA11CE);
    address treasury  = address(0x7);
    address oracle    = address(0x0AC1E);
    address oracle2   = address(0x0AC1E2);
    address donor     = address(0xD0);
    address recipient = address(0xBEEF);

    function setUp() public {
        usdc = new MockUSDC();
        vm.prank(admin);
        pool = new AMZakatPool(address(usdc), treasury, admin);

        vm.prank(admin);
        pool.addOracle(oracle);
        vm.prank(admin);
        pool.addOracle(oracle2);

        // Fund the donor and approve the pool.
        usdc.mint(donor, 1_000_000e6);
        vm.prank(donor);
        usdc.approve(address(pool), type(uint256).max);
    }

    // ── Ujrah quoting (tiered) ────────────────────────────────────────────────
    function testUjrahTiers() public view {
        // < $1,000 → 2.5%
        assertEq(pool.quoteUjrah(500e6), (500e6 * 250) / 10_000);   // 12.5
        // $1,000–$10,000 → 1.5%
        assertEq(pool.quoteUjrah(5_000e6), (5_000e6 * 150) / 10_000); // 75
        // ≥ $10,000 → 1.0%
        assertEq(pool.quoteUjrah(20_000e6), (20_000e6 * 100) / 10_000); // 200
    }

    // ── Recipient registration ────────────────────────────────────────────────
    function testOnlyOracleCanRegister() public {
        vm.prank(donor);
        vm.expectRevert();
        pool.registerRecipient(recipient, 82, 1);
    }

    function testRegisterRecipient() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        (bool registered, uint8 score, uint8 category,,,) = pool.recipients(recipient);
        assertTrue(registered);
        assertEq(score, 82);
        assertEq(category, 1);
    }

    function testCannotRegisterTwice() public {
        vm.startPrank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.expectRevert(bytes("already registered"));
        pool.registerRecipient(recipient, 70, 2);
        vm.stopPrank();
    }

    function testBadCategoryReverts() public {
        vm.prank(oracle);
        vm.expectRevert(bytes("bad category"));
        pool.registerRecipient(recipient, 82, 9);
    }

    // ── Donation: full Zakat to escrow, ujrah on top to treasury ───────────────
    function testDonateRoutesFundsCorrectly() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);

        uint256 zakat = 500e6;            // < $1,000 → 2.5%
        uint256 ujrah = pool.quoteUjrah(zakat); // 12.5e6

        vm.prank(donor);
        pool.donate(recipient, zakat, type(uint256).max);

        // Full Zakat is escrowed; ujrah went to treasury.
        assertEq(usdc.balanceOf(address(pool)), zakat);
        assertEq(usdc.balanceOf(treasury), ujrah);
        assertEq(pool.totalEscrow(), zakat);
        assertEq(pool.totalUjrah(), ujrah);

        (,,,, uint256 escrow,) = pool.recipients(recipient);
        assertEq(escrow, zakat);
    }

    function testCannotDonateToUnregistered() public {
        vm.prank(donor);
        vm.expectRevert(bytes("recipient not verified"));
        pool.donate(recipient, 500e6, type(uint256).max);
    }

    // ── Release: needs `releaseThreshold` DISTINCT oracles to agree ────────────
    function testReleaseToRecipient() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(oracle);
        uint256 requestId = pool.requestRelease(recipient, 500e6);

        // First oracle's proposal counts as one confirmation, but the default
        // threshold is 2 — funds must still be sitting in escrow.
        assertEq(usdc.balanceOf(recipient), 0);
        assertEq(pool.totalEscrow(), 500e6);

        vm.prank(oracle2);
        pool.confirmRelease(requestId);

        assertEq(usdc.balanceOf(recipient), 500e6);
        assertEq(pool.totalEscrow(), 0);
        assertEq(pool.totalDistributed(), 500e6);
    }

    function testSameOracleCannotConfirmTwice() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(oracle);
        uint256 requestId = pool.requestRelease(recipient, 500e6);

        vm.prank(oracle);
        vm.expectRevert(bytes("already confirmed"));
        pool.confirmRelease(requestId);
    }

    function testCannotRequestReleaseMoreThanEscrow() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(oracle);
        vm.expectRevert(bytes("bad amount"));
        pool.requestRelease(recipient, 600e6);
    }

    function testOnlyOracleCanRequestOrConfirmRelease() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(donor);
        vm.expectRevert();
        pool.requestRelease(recipient, 500e6);

        vm.prank(oracle);
        uint256 requestId = pool.requestRelease(recipient, 500e6);

        vm.prank(donor);
        vm.expectRevert();
        pool.confirmRelease(requestId);
    }

    // ── Admin: ujrah cap is enforced ───────────────────────────────────────────
    function testCannotSetUjrahAboveCap() public {
        AMZakatPool.UjrahTier[] memory tiers = new AMZakatPool.UjrahTier[](1);
        tiers[0] = AMZakatPool.UjrahTier({minAmount: 0, bps: 300}); // 3% > cap
        vm.prank(admin);
        vm.expectRevert(bytes("ujrah > cap"));
        pool.setUjrahTiers(tiers);
    }

    // ── Pausable ───────────────────────────────────────────────────────────────
    function testPauseBlocksDonations() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(admin);
        pool.pause();

        vm.prank(donor);
        vm.expectRevert();
        pool.donate(recipient, 500e6, type(uint256).max);
    }

    // ── Oracle staking ─────────────────────────────────────────────────────────
    function _fundOracle(address o, uint256 amount) internal {
        usdc.mint(o, amount);
        vm.prank(o);
        usdc.approve(address(pool), type(uint256).max);
    }

    function testStakeAndUnstake() public {
        _fundOracle(oracle, 1_000e6);

        vm.prank(oracle);
        pool.stakeAsOracle(1_000e6);
        (uint256 stake,,,,) = pool.oracleInfo(oracle);
        assertEq(stake, 1_000e6);
        assertEq(usdc.balanceOf(address(pool)), 1_000e6);

        vm.prank(oracle);
        pool.unstake(400e6);
        (stake,,,,) = pool.oracleInfo(oracle);
        assertEq(stake, 600e6);
        assertEq(usdc.balanceOf(oracle), 400e6);
    }

    function testNonOracleCannotStake() public {
        _fundOracle(donor, 1_000e6);
        vm.prank(donor);
        vm.expectRevert(bytes("not an oracle"));
        pool.stakeAsOracle(1_000e6);
    }

    function testMinStakeBlocksUnstakedOracle() public {
        vm.prank(admin);
        pool.setMinOracleStake(1_000e6);

        // Oracle hasn't staked yet — every gated action reverts.
        vm.prank(oracle);
        vm.expectRevert(bytes("oracle stake below minimum"));
        pool.registerRecipient(recipient, 82, 1);

        _fundOracle(oracle, 1_000e6);
        vm.prank(oracle);
        pool.stakeAsOracle(1_000e6);

        // Now meets the minimum — same call succeeds.
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        (bool registered,,,,,) = pool.recipients(recipient);
        assertTrue(registered);
    }

    // ── Per-oracle release cap ──────────────────────────────────────────────────
    function testReleaseCapBlocksOverLimitConfirmation() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(admin);
        pool.setOracleReleaseCap(oracle2, 100e6); // oracle2 may only confirm up to 100 per period

        vm.prank(oracle);
        uint256 requestId = pool.requestRelease(recipient, 500e6);

        vm.prank(oracle2);
        vm.expectRevert(bytes("oracle release cap exceeded for this period"));
        pool.confirmRelease(requestId);
    }

    function testReleaseCapAllowsWithinLimit() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(admin);
        pool.setOracleReleaseCap(oracle2, 500e6);

        vm.prank(oracle);
        uint256 requestId = pool.requestRelease(recipient, 500e6);
        vm.prank(oracle2);
        pool.confirmRelease(requestId);

        assertEq(usdc.balanceOf(recipient), 500e6);
        (, , , uint256 releasedInPeriod, ) = pool.oracleInfo(oracle2);
        assertEq(releasedInPeriod, 500e6);
    }

    // ── Slashing ────────────────────────────────────────────────────────────────
    function testSlashOracleMovesStakeToTreasuryAndRecordsStrike() public {
        _fundOracle(oracle, 1_000e6);
        vm.prank(oracle);
        pool.stakeAsOracle(1_000e6);

        vm.prank(admin);
        pool.slashOracle(oracle, 400e6, "fabricated delivery, case #1");

        (uint256 stake, uint32 strikes,,,) = pool.oracleInfo(oracle);
        assertEq(stake, 600e6);
        assertEq(strikes, 1);
        assertEq(usdc.balanceOf(treasury), 400e6);
        assertTrue(pool.hasRole(pool.ORACLE_ROLE(), oracle)); // one strike doesn't revoke
    }

    function testSlashPastMaxStrikesRevokesOracleRole() public {
        _fundOracle(oracle, 1_000e6);
        vm.prank(oracle);
        pool.stakeAsOracle(1_000e6);

        vm.prank(admin);
        pool.slashOracle(oracle, 0, "strike 1"); // strikes=1
        vm.prank(admin);
        pool.slashOracle(oracle, 0, "strike 2"); // strikes=2 (MAX_STRIKES)
        assertTrue(pool.hasRole(pool.ORACLE_ROLE(), oracle));

        vm.prank(admin);
        pool.slashOracle(oracle, 0, "strike 3"); // strikes=3 > MAX_STRIKES
        assertFalse(pool.hasRole(pool.ORACLE_ROLE(), oracle));
    }

    function testOnlyAdminCanSlash() public {
        vm.prank(oracle2);
        vm.expectRevert();
        pool.slashOracle(oracle, 0, "not your call");
    }

    // ── Audit flagging ──────────────────────────────────────────────────────────
    function testFlagForAudit() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);
        vm.prank(oracle);
        uint256 requestId = pool.requestRelease(recipient, 500e6);
        vm.prank(oracle2);
        pool.confirmRelease(requestId);

        assertFalse(pool.releaseDisputed(requestId));
        vm.prank(admin);
        pool.flagForAudit(requestId, "random sample audit, Q3");
        assertTrue(pool.releaseDisputed(requestId));
    }
}
