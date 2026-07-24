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
    address donor     = address(0xD0);
    address recipient = address(0xBEEF);

    function setUp() public {
        usdc = new MockUSDC();
        vm.prank(admin);
        pool = new AMZakatPool(address(usdc), treasury, admin);

        vm.prank(admin);
        pool.addOracle(oracle);

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

    // ── Release: oracle confirms delivery, recipient receives full Zakat ───────
    function testReleaseToRecipient() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(oracle);
        pool.release(recipient, 500e6);

        assertEq(usdc.balanceOf(recipient), 500e6);
        assertEq(pool.totalEscrow(), 0);
        assertEq(pool.totalDistributed(), 500e6);
    }

    function testCannotReleaseMoreThanEscrow() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(oracle);
        vm.expectRevert(bytes("bad amount"));
        pool.release(recipient, 600e6);
    }

    function testOnlyOracleCanRelease() public {
        vm.prank(oracle);
        pool.registerRecipient(recipient, 82, 1);
        vm.prank(donor);
        pool.donate(recipient, 500e6, type(uint256).max);

        vm.prank(donor);
        vm.expectRevert();
        pool.release(recipient, 500e6);
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
}
