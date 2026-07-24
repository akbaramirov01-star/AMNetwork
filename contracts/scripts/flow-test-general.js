// End-to-end verification of AMZakatPoolGeneral (the undirected/shared pool)
// against the actual compiled bytecode, on a local EVM.
//
// This contract previously had ZERO test coverage while carrying a strictly
// worse trust model than AMZakatPool: every ORACLE_ROLE key can reach the whole
// shared poolBalance, not just one recipient's escrow. The centrepiece here is
// the rate-limit check: a rogue/phished oracle must NOT be able to drain the
// pool in one sitting.
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ARTIFACTS = path.join(__dirname, "..", "artifacts-manual");
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(ARTIFACTS, name + ".json"), "utf8"));
}
const U = (n) => ethers.formatUnits(n, 6);

async function expectRevert(promiseFn, label) {
  let reverted = false;
  try { await promiseFn(); } catch (e) { reverted = true; }
  assert(reverted, `expected revert: ${label}`);
}

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const [admin, oracle, oracle2, donor, r1, r2, treasury] = await Promise.all(
    [0, 1, 2, 3, 4, 5, 6].map((i) => provider.getSigner(i))
  );
  const addr = async (s) => await s.getAddress();
  // resolve up front so the expectRevert() arrows stay synchronous
  const A = {
    admin: await addr(admin), oracle: await addr(oracle), oracle2: await addr(oracle2),
    donor: await addr(donor), r1: await addr(r1), r2: await addr(r2), treasury: await addr(treasury),
  };

  console.log("── Deploying MockUSDC + AMZakatPoolGeneral ──");
  const usdcArt = load("MockUSDC");
  const usdc = await new ethers.ContractFactory(usdcArt.abi, usdcArt.bytecode, admin).deploy();
  await usdc.waitForDeployment();

  const poolArt = load("AMZakatPoolGeneral");
  const pool = await new ethers.ContractFactory(poolArt.abi, poolArt.bytecode, admin).deploy(
    await usdc.getAddress(), A.treasury, A.admin
  );
  await pool.waitForDeployment();
  console.log("AMZakatPoolGeneral deployed at", await pool.getAddress());

  const dailyLimit = await pool.oracleDailyLimit();
  assert.strictEqual(dailyLimit, 10_000_000000n, "expected default daily limit of 10,000");
  console.log("PASS — default oracle daily limit:", U(dailyLimit), "per oracle per 24h");

  await (await pool.connect(admin).addOracle(A.oracle)).wait();
  await (await pool.connect(admin).addOracle(A.oracle2)).wait();

  // ── Donor gives to the general pool ────────────────────────────────────────
  console.log("\n── Donor gives 25,000 to the general pool ──");
  const zakat = 25_000_000000n;
  await (await usdc.connect(admin).mint(A.donor, 30_000_000000n)).wait();
  await (await usdc.connect(donor).approve(await pool.getAddress(), ethers.MaxUint256)).wait();

  const ujrah = await pool.quoteUjrah(zakat);
  assert.strictEqual(ujrah, 250_000000n, "expected 1.0% tier = 250 on a 25,000 donation");

  // fee-slippage guard also applies here
  await expectRevert(
    () => pool.connect(donor).donate(zakat, ujrah - 1n),
    "donate with maxUjrah below the live quote"
  );
  console.log("PASS — donate reverts when live ujrah exceeds the donor's maxUjrah");

  await (await pool.connect(donor).donate(zakat, ujrah)).wait();
  assert.strictEqual(await pool.poolBalance(), zakat, "poolBalance should hold the full principal");
  assert.strictEqual(await usdc.balanceOf(A.treasury), ujrah, "treasury ujrah mismatch");
  console.log("PASS — pool holds full", U(zakat), "principal; treasury got exactly", U(ujrah), "ujrah");

  // ── Recipients ─────────────────────────────────────────────────────────────
  await (await pool.connect(oracle).registerRecipient(A.r1, 91, 1)).wait();
  await (await pool.connect(oracle).registerRecipient(A.r2, 78, 6)).wait();
  console.log("PASS — two recipients registered by oracle");

  await expectRevert(
    () => pool.connect(donor).distribute(A.r1, 1_000000n),
    "non-oracle distribute"
  );
  console.log("PASS — non-oracle cannot distribute");

  // ── THE KEY TEST: rogue oracle cannot drain the shared pool ────────────────
  console.log("\n── Rate limit: a single oracle key must not drain the pool ──");
  await (await pool.connect(oracle).distribute(A.r1, 9_000_000000n)).wait();
  assert.strictEqual(await pool.oracleRemainingToday(A.oracle), 1_000_000000n,
    "remaining allowance after 9,000 should be 1,000");
  console.log("   oracle distributed 9,000 legitimately — remaining today:",
    U(await pool.oracleRemainingToday(A.oracle)));

  const poolBeforeAttack = await pool.poolBalance();
  await expectRevert(
    () => pool.connect(oracle).distribute(A.r1, poolBeforeAttack),
    "oracle draining the entire remaining pool in one tx"
  );
  assert.strictEqual(await pool.poolBalance(), poolBeforeAttack, "pool must be untouched after blocked drain");
  console.log("PASS — attempt to sweep the remaining", U(poolBeforeAttack),
    "was BLOCKED; pool untouched");

  await (await pool.connect(oracle).distribute(A.r1, 1_000_000000n)).wait();
  assert.strictEqual(await pool.oracleRemainingToday(A.oracle), 0n, "allowance should be exhausted");
  await expectRevert(
    () => pool.connect(oracle).distribute(A.r1, 1n),
    "distribution of 1 unit past an exhausted daily allowance"
  );
  console.log("PASS — allowance exhausted at exactly the limit; even 1 more unit reverts");

  const survived = await pool.poolBalance();
  assert(survived > 0n, "funds should remain beyond one oracle's daily reach");
  console.log("PASS —", U(survived), "of donor funds remain out of that oracle's reach today");

  // ── batchDistribute must accumulate across the whole loop ──────────────────
  console.log("\n── batchDistribute accumulates against the same allowance ──");
  await expectRevert(
    () => pool.connect(oracle2).batchDistribute(
      [A.r1, A.r2], [6_000_000000n, 5_000_000000n]
    ),
    "batch totalling 11,000 against a 10,000 allowance"
  );
  console.log("PASS — batch totalling 11,000 blocked (limit is not reset per recipient)");

  await (await pool.connect(oracle2).batchDistribute(
    [A.r1, A.r2], [5_000_000000n, 5_000_000000n]
  )).wait();
  assert.strictEqual(await pool.oracleRemainingToday(A.oracle2), 0n, "oracle2 allowance mismatch");
  console.log("PASS — batch totalling exactly 10,000 succeeded");

  // ── Admin can widen the limit deliberately ─────────────────────────────────
  console.log("\n── Admin raises the limit (deliberate, audited action) ──");
  await expectRevert(
    () => pool.connect(oracle).setOracleDailyLimit(1n),
    "oracle changing its own limit"
  );
  console.log("PASS — an oracle cannot raise its own limit");

  await (await pool.connect(admin).setOracleDailyLimit(100_000_000000n)).wait();
  const rest = await pool.poolBalance();
  await (await pool.connect(oracle).distribute(A.r2, rest)).wait();
  assert.strictEqual(await pool.poolBalance(), 0n, "pool should be fully distributed");
  console.log("PASS — after admin raised the limit, remaining", U(rest), "distributed");

  // ── Accounting invariant ───────────────────────────────────────────────────
  const paidOut = (await usdc.balanceOf(A.r1)) + (await usdc.balanceOf(A.r2));
  assert.strictEqual(paidOut, zakat, "recipients must receive 100% of the Zakat principal");
  assert.strictEqual(await pool.totalDistributed(), zakat, "totalDistributed mismatch");
  assert.strictEqual(await usdc.balanceOf(await pool.getAddress()), 0n, "contract should hold no residual");
  console.log("PASS — recipients received 100% of principal (", U(paidOut), "), nothing skimmed");

  // ── Pause ──────────────────────────────────────────────────────────────────
  await (await pool.connect(admin).pause()).wait();
  await expectRevert(() => pool.connect(donor).donate(1_000000n, ethers.MaxUint256), "donate while paused");
  await expectRevert(() => pool.connect(oracle).distribute(A.r1, 1n), "distribute while paused");
  console.log("PASS — pause blocks both donate and distribute");
  await (await pool.connect(admin).unpause()).wait();

  console.log("\n=================================================");
  console.log("ALL 16 CHECKS PASSED — AMZakatPoolGeneral verified,");
  console.log("including the rate limit that stops a single rogue");
  console.log("oracle key from draining the whole shared pool.");
  console.log("=================================================");
}

module.exports = main;

if (require.main === module) {
  main().catch((e) => { console.error("\nTEST FAILED:", e.message || e); process.exit(1); });
}
