// End-to-end verification of the AMZakatPool donation flow against the
// actual compiled bytecode, run on a local EVM (Hardhat Network).
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ARTIFACTS = path.join(__dirname, "..", "artifacts-manual");
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(ARTIFACTS, name + ".json"), "utf8"));
}

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const [admin, oracle, donor, recipient, treasury] = await Promise.all(
    [0, 1, 2, 3, 4].map((i) => provider.getSigner(i))
  );

  console.log("── Deploying MockUSDC (test stablecoin) ──");
  const usdcArt = load("MockUSDC");
  const usdc = await new ethers.ContractFactory(usdcArt.abi, usdcArt.bytecode, admin).deploy();
  await usdc.waitForDeployment();
  console.log("MockUSDC deployed at", await usdc.getAddress());

  console.log("\n── Deploying AMZakatPool ──");
  const poolArt = load("AMZakatPool");
  const pool = await new ethers.ContractFactory(poolArt.abi, poolArt.bytecode, admin).deploy(
    await usdc.getAddress(),
    await treasury.getAddress(),
    await admin.getAddress()
  );
  await pool.waitForDeployment();
  console.log("AMZakatPool deployed at", await pool.getAddress());

  console.log("\n── Admin grants ORACLE_ROLE to oracle account ──");
  const ORACLE_ROLE = await pool.ORACLE_ROLE();
  await (await pool.connect(admin).addOracle(await oracle.getAddress())).wait();
  assert(await pool.hasRole(ORACLE_ROLE, await oracle.getAddress()), "oracle role not granted");
  console.log("PASS — oracle role granted:", await oracle.getAddress());

  console.log("\n── Oracle registers recipient (score 87, category 4) ──");
  await (await pool.connect(oracle).registerRecipient(await recipient.getAddress(), 87, 4)).wait();
  const r1 = await pool.recipients(await recipient.getAddress());
  assert.strictEqual(r1.registered, true, "recipient not registered");
  assert.strictEqual(Number(r1.score), 87, "score mismatch");
  console.log("PASS — recipient registered, score =", r1.score.toString());

  console.log("\n── Fund donor with 5,000 test USDC ──");
  await (await usdc.connect(admin).mint(await donor.getAddress(), 5_000_000000n)).wait();

  console.log("\n── Donor donates 2,000 Zakat (tiered ujrah fee applies) ──");
  const zakatAmount = 2_000_000000n;
  const ujrah = await pool.quoteUjrah(zakatAmount);
  assert.strictEqual(ujrah, 30_000000n, "ujrah tier calculation wrong (expected 1.5% = 30 USDC)");
  console.log("PASS — quoted ujrah:", ethers.formatUnits(ujrah, 6), "USDC (1.5% tier)");

  await (await usdc.connect(donor).approve(await pool.getAddress(), zakatAmount + ujrah)).wait();
  const tx = await pool.connect(donor).donate(await recipient.getAddress(), zakatAmount, ujrah);
  const receipt = await tx.wait();
  const donatedEvent = receipt.logs
    .map((l) => { try { return pool.interface.parseLog(l); } catch { return null; } })
    .find((e) => e && e.name === "Donated");
  assert(donatedEvent, "Donated event not emitted");
  console.log("PASS — Donated event: zakat =", ethers.formatUnits(donatedEvent.args.zakat, 6),
              "ujrah =", ethers.formatUnits(donatedEvent.args.ujrah, 6));

  const treasuryBal = await usdc.balanceOf(await treasury.getAddress());
  assert.strictEqual(treasuryBal, ujrah, "treasury did not receive exact ujrah");
  console.log("PASS — treasury received exact ujrah:", ethers.formatUnits(treasuryBal, 6), "USDC");

  const rAfterDonate = await pool.recipients(await recipient.getAddress());
  assert.strictEqual(rAfterDonate.escrow, zakatAmount, "escrow mismatch");
  console.log("PASS — full Zakat principal held in escrow (0% taken):", ethers.formatUnits(rAfterDonate.escrow, 6), "USDC");

  console.log("\n── Non-oracle tries to release funds early (must revert) ──");
  let reverted = false;
  try {
    await pool.connect(donor).release(await recipient.getAddress(), zakatAmount);
  } catch (e) {
    reverted = true;
  }
  assert(reverted, "non-oracle release should have reverted");
  console.log("PASS — correctly reverted, only ORACLE_ROLE can release funds");

  console.log("\n── Oracle confirms physical delivery → releases escrow ──");
  const recipientBalBefore = await usdc.balanceOf(await recipient.getAddress());
  await (await pool.connect(oracle).release(await recipient.getAddress(), zakatAmount)).wait();
  const recipientBalAfter = await usdc.balanceOf(await recipient.getAddress());
  assert.strictEqual(recipientBalAfter - recipientBalBefore, zakatAmount, "recipient did not receive full zakat");
  console.log("PASS — recipient received full Zakat, no cut taken:", ethers.formatUnits(recipientBalAfter, 6), "USDC");

  const rFinal = await pool.recipients(await recipient.getAddress());
  assert.strictEqual(rFinal.escrow, 0n, "escrow should be zero after release");
  assert.strictEqual(rFinal.received, zakatAmount, "lifetime received mismatch");
  console.log("PASS — escrow cleared, lifetime received tracked correctly");

  console.log("\n── Fee-slippage guard: admin raises tiers mid-flight ──");
  // Donor saw the 1.5% tier (30 USDC on a 2,000 donation) and signs a donate()
  // bounded by that. Admin then raises the applicable tier to the 2.5% cap
  // before the donor's tx mines. Without maxUjrah the donor would silently pay
  // 50 instead of 30; with it, the tx must revert.
  const quoteBefore = await pool.quoteUjrah(zakatAmount);
  await (await pool.connect(admin).setUjrahTiers([[0, 250]])).wait();
  const quoteAfter = await pool.quoteUjrah(zakatAmount);
  assert(quoteAfter > quoteBefore, "tier change should have raised the live quote");
  console.log("   live ujrah moved from", ethers.formatUnits(quoteBefore, 6),
              "->", ethers.formatUnits(quoteAfter, 6), "USDC");

  await (await usdc.connect(admin).mint(await donor.getAddress(), 3_000_000000n)).wait();
  await (await usdc.connect(donor).approve(await pool.getAddress(), ethers.MaxUint256)).wait();

  let slippageReverted = false;
  try {
    await pool.connect(donor).donate(await recipient.getAddress(), zakatAmount, quoteBefore);
  } catch (e) {
    slippageReverted = true;
  }
  assert(slippageReverted, "donate must revert when live ujrah exceeds maxUjrah");
  console.log("PASS — donate reverted: donor was not silently overcharged");

  const treasuryBeforeOk = await usdc.balanceOf(await treasury.getAddress());
  await (await pool.connect(donor).donate(await recipient.getAddress(), zakatAmount, quoteAfter)).wait();
  const treasuryAfterOk = await usdc.balanceOf(await treasury.getAddress());
  assert.strictEqual(treasuryAfterOk - treasuryBeforeOk, quoteAfter, "accepted-bound donation charged wrong ujrah");
  console.log("PASS — same donation succeeds once the donor accepts the new bound");

  // restore default tiers so later assertions see the documented schedule
  await (await pool.connect(admin).setUjrahTiers([[0, 250], [1_000_000000n, 150], [10_000_000000n, 100]])).wait();
  await (await pool.connect(oracle).release(await recipient.getAddress(), zakatAmount)).wait();

  console.log("\n── Admin pauses contract (emergency kill-switch) ──");
  await (await pool.connect(admin).pause()).wait();
  let pausedReverted = false;
  try {
    await usdc.connect(admin).mint(await donor.getAddress(), 1_000000n);
    await usdc.connect(donor).approve(await pool.getAddress(), 1_000000n);
    await pool.connect(donor).donate(await recipient.getAddress(), 500000n, ethers.MaxUint256);
  } catch (e) {
    pausedReverted = true;
  }
  assert(pausedReverted, "donate should revert while paused");
  console.log("PASS — donations correctly blocked while paused");
  await (await pool.connect(admin).unpause()).wait();
  console.log("PASS — unpaused successfully");

  console.log("\n=================================================");
  console.log("ALL 13 CHECKS PASSED — full donate -> escrow -> verify");
  console.log("-> release flow verified end-to-end against the real");
  console.log("compiled AMZakatPool.sol bytecode on a live local EVM.");
  console.log("=================================================");
}

module.exports = main;

if (require.main === module) {
  main().catch((e) => {
    console.error("\nTEST FAILED:", e.message || e);
    process.exit(1);
  });
}
