// Compiles the AM Network contracts using the solc npm package (WASM build,
// no native-binary download required — works in restricted-network setups
// where Hardhat's built-in downloader (binaries.soliditylang.org) is blocked.
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const ROOT = path.join(__dirname, "..");
const sourceFiles = [
  { file: "AMZakatPool.sol", dir: ROOT },
  { file: "AMZakatPoolGeneral.sol", dir: ROOT },
  { file: "MockUSDC.sol", dir: path.join(ROOT, "test-mocks") },
];

const sources = {};
for (const { file, dir } of sourceFiles) {
  sources[file] = { content: fs.readFileSync(path.join(dir, file), "utf8") };
}

function findImport(importPath) {
  try {
    const resolved = require.resolve(importPath, { paths: [ROOT] });
    return { contents: fs.readFileSync(resolved, "utf8") };
  } catch (e) {
    return { error: "File not found: " + importPath };
  }
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));

let hasError = false;
if (output.errors) {
  for (const err of output.errors) {
    console.log(err.severity.toUpperCase() + ":", err.formattedMessage);
    if (err.severity === "error") hasError = true;
  }
}

if (hasError) {
  console.log("\n❌ COMPILATION FAILED");
  process.exit(1);
}

const artifactsDir = path.join(ROOT, "artifacts-manual");
fs.mkdirSync(artifactsDir, { recursive: true });

for (const { file } of sourceFiles) {
  const contracts = output.contracts[file];
  for (const name of Object.keys(contracts)) {
    const c = contracts[name];
    fs.writeFileSync(
      path.join(artifactsDir, name + ".json"),
      JSON.stringify({ abi: c.abi, bytecode: "0x" + c.evm.bytecode.object }, null, 2)
    );
    console.log(`Compiled ${name} — bytecode ${c.evm.bytecode.object.length / 2} bytes`);
  }
}

console.log("\nCompilation OK — 0 errors, 0 warnings suppressed");
