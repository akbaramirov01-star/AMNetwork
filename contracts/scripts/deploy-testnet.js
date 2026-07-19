// Deploys MockUSDC + AMZakatPool to Base Sepolia testnet, and runs one real
// on-chain demo transaction (register a recipient) so the deployment isn't
// just an empty contract sitting there.
//
// Requires contracts/.env with:
//   DEPLOYER_PRIVATE_KEY=0x...   (a TESTNET-ONLY wallet, funded with free Base Sepolia ETH)
//   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const ARTIFACTS = path.join(__dirname, "..", "artifacts-manual");
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(ARTIFACTS, name + ".json"), "utf8"));
}

async function main() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error("Missing DEPLOYER_PRIVATE_KEY in contracts/.env");
  }

  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
  const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  const balance = await provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH (Base Sepolia testnet)");
  if (balance === 0n) {
    console.log("\n❌ Deployer wallet has no testnet ETH. Fund it from a Base Sepolia faucet first, then re-run.");
    process.exit(1);
  }

  console.log("\n── Deploying MockUSDC ──");
  const usdcArt = load("MockUSDC");
  const usdc = await new ethers.ContractFactory(usdcArt.abi, usdcArt.bytecode, deployer).deploy();
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("MockUSDC:", usdcAddr);

  console.log("\n── Deploying AMZakatPool ──");
  const poolArt = load("AMZakatPool");
  const pool = await new ethers.ContractFactory(poolArt.abi, poolArt.bytecode, deployer).deploy(
    usdcAddr,
    deployer.address, // treasury = deployer for this demo
    deployer.address  // admin   = deployer for this demo
  );
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("AMZakatPool:", poolAddr);

  console.log("\n── Demo on-chain transaction: registering a sample recipient ──");
  const demoRecipient = "0x000000000000000000000000000000000000dEaD"; // burn address as a visible demo placeholder
  const tx = await pool.registerRecipient(demoRecipient, 87, 4);
  const receipt = await tx.wait();
  console.log("Recipient registered. Tx hash:", receipt.hash);

  const result = {
    network: "Base Sepolia",
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: { MockUSDC: usdcAddr, AMZakatPool: poolAddr },
    demoTx: receipt.hash,
    explorer: {
      MockUSDC: `https://sepolia.basescan.org/address/${usdcAddr}`,
      AMZakatPool: `https://sepolia.basescan.org/address/${poolAddr}`,
      demoTx: `https://sepolia.basescan.org/tx/${receipt.hash}`,
    },
  };
  fs.writeFileSync(path.join(__dirname, "..", "deployments.json"), JSON.stringify(result, null, 2));

  console.log("\n=================================================");
  console.log("DEPLOYED TO BASE SEPOLIA TESTNET");
  console.log("AMZakatPool:", result.explorer.AMZakatPool);
  console.log("Demo tx:    ", result.explorer.demoTx);
  console.log("=================================================");
}

main().catch((e) => {
  console.error("\nDEPLOY FAILED:", e.message || e);
  process.exit(1);
});
