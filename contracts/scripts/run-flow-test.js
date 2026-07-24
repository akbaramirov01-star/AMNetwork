// One-command test runner: compiles the contracts, spins up a local Hardhat
// EVM node, runs the end-to-end flow test against it, then tears the node
// down. This is what `npm test` runs.
const { spawn } = require("child_process");
const path = require("path");

function waitForNode(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      })
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeoutMs) reject(new Error("hardhat node did not start in time"));
          else setTimeout(tryOnce, 300);
        });
    };
    tryOnce();
  });
}

async function main() {
  console.log("=== 1/4 Compiling contracts ===\n");
  require("./compile.js");

  console.log("\n=== 2/4 Starting local EVM (Hardhat Network) ===\n");
  const node = spawn("npx", ["hardhat", "node"], {
    cwd: path.join(__dirname, ".."),
    stdio: "ignore",
  });

  const cleanup = () => { try { node.kill(); } catch (e) {} };
  process.on("exit", cleanup);
  process.on("SIGINT", () => { cleanup(); process.exit(1); });

  try {
    await waitForNode("http://127.0.0.1:8545");
    console.log("Local EVM ready at http://127.0.0.1:8545\n");

    console.log("=== 3/4 Running AMZakatPool flow test (directed donations) ===\n");
    const flowTest = require("./flow-test.js");
    await flowTest();

    console.log("\n=== 4/4 Running AMZakatPoolGeneral flow test (shared pool) ===\n");
    const flowTestGeneral = require("./flow-test-general.js");
    await flowTestGeneral();

    cleanup();
    process.exit(0);
  } catch (e) {
    console.error(e);
    cleanup();
    process.exit(1);
  }
}

main();
