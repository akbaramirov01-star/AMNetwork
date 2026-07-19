// Minimal config so `npx hardhat node` can run a local EVM.
// Actual compilation is done by scripts/compile.js via the solc npm package
// directly (works even in network environments that block
// binaries.soliditylang.org, which Hardhat's own compiler downloader needs).
module.exports = {
  solidity: "0.8.24",
};
