# AM Network — Smart Contracts

Prototype Solidity contracts for the blockchain-verified Zakat & Sadaqah platform.

## Verify it yourself

```bash
npm install
npm test
```

This compiles `AMZakatPool.sol` against real OpenZeppelin v5 contracts and runs
a full end-to-end flow — register recipient → donor donates → tiered ujrah fee
computed and routed to treasury → non-oracle release attempt correctly
reverts → oracle releases full Zakat principal to the recipient → pause/unpause
kill-switch — against the actual compiled bytecode on a local EVM (Hardhat
Network). 9/9 checks pass. `AMZakatPoolGeneral.sol` is compiled by the same
suite but not yet covered by the flow test.

This is **not** a mainnet deployment — see "Before mainnet" below for what
still has to happen first.

## Deploy to Base Sepolia testnet (no real funds, free)

```bash
cp .env.example .env   # fill in a TESTNET-ONLY private key + address
npm run deploy:testnet
```

Deploys a mock USDC + `AMZakatPool` to Base Sepolia and runs one real demo
transaction, printing Basescan links so anyone can verify it on-chain. Needs
free testnet ETH from a Base Sepolia faucet (e.g. the Coinbase or Alchemy
Base Sepolia faucet) sent to `DEPLOYER_ADDRESS` first. This step needs real
outbound network access to `sepolia.base.org` — it cannot run inside a
network-restricted sandbox.

## `AMZakatPool.sol`

The core escrow + distribution contract.

### Sharia model — Wakala bil Ujrah (agency for a fee)

- **The donor's full Zakat (100%) reaches the recipient.** Nothing is taken from the Zakat principal.
- The platform's **service fee (ujrah)** is charged *on top* of the Zakat and routed to the treasury. This avoids the fiqh objection of "taking from the share of the poor."
- Settlement uses a **stablecoin** (e.g. USDC on Base) — no speculative token, so no gharar/maysir on the value transferred.

### Ujrah tiers (default)

Larger donations pay a lower service rate, because processing cost does not scale linearly. Hard-capped at **2.5%** so the fee can never become exploitative.

| Donation size | Ujrah |
|---------------|-------|
| < $1,000      | 2.5%  |
| $1,000–$10,000| 1.5%  |
| ≥ $10,000     | 1.0%  |

Tiers are adjustable by ADMIN within the `MAX_UJRAH_BPS` ceiling.

### Flow

1. **Oracle** (verified mosque imam / NGO / AM volunteer) registers a recipient with their AI score (0–100) and Asnaf category (1–8).
2. **Donor** calls `donate(recipient, zakatAmount)` after approving `zakatAmount + ujrah`. Zakat → escrow, ujrah → treasury.
3. Funds sit in escrow allocated to that recipient.
4. **Oracle** confirms physical delivery → `release(recipient, amount)` sends the full Zakat to the recipient.

Every step emits an event — that **is** the public, auditable on-chain ledger the website advertises.

### Roles

- `DEFAULT_ADMIN_ROLE` / `ADMIN_ROLE` — config, treasury, oracle management, pause. **Must be a multisig (Gnosis Safe) in production.**
- `ORACLE_ROLE` — register/verify recipients and release funds. The local oracle network.

### Security features

- `ReentrancyGuard` on all fund-moving functions
- `Pausable` kill-switch for emergencies
- `SafeERC20` for non-standard token safety
- Hard cap on ujrah
- Score / category validation

## ⚠️ Before mainnet — this is a PROTOTYPE

Do **not** deploy with real funds until:

1. **Professional security audit** (e.g. OpenZeppelin, Trail of Bits, Halborn) — budgeted at $40k in the seed plan.
2. **Sharia advisory board sign-off** on the ujrah mechanics and the wakala structure.
3. **Multisig** (Gnosis Safe) holds `ADMIN_ROLE` — never a single private key.
4. Comprehensive **test suite** (Foundry/Hardhat) covering reentrancy, access control, edge cases.
5. **Testnet deployment** on Base Sepolia with real oracle dry-runs.

## Local setup (for the engineer who joins)

```bash
# Foundry
forge init
forge install OpenZeppelin/openzeppelin-contracts
forge build
forge test

# or Hardhat
npm install --save-dev hardhat @openzeppelin/contracts
npx hardhat compile
npx hardhat test
```

## Suggested next contracts

- `AMZakatPoolGeneral.sol` — undirected donations to a general pool, distributed by score ranking.
- `NFTCertificate.sol` — AM Academy completion certificates (ERC-721).
- `OracleRegistry.sol` — staking / reputation for oracles to disincentivize fraud.
