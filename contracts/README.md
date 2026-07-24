# AM Network — Smart Contracts

Prototype Solidity contracts for the blockchain-verified Zakat & Sadaqah platform.

## Verify it yourself

```bash
npm install
npm test
```

Compiles both contracts against real OpenZeppelin v5 and runs two end-to-end
suites against the actual compiled bytecode on a local EVM (Hardhat Network).
**29/29 checks pass.**

`AMZakatPool` (directed donations) — 13 checks: register recipient → donor
donates → tiered ujrah computed and routed to treasury → full principal held in
escrow → non-oracle release reverts → oracle releases 100% to the recipient →
**fee-slippage guard blocks a mid-flight tier hike** → pause/unpause kill-switch.

`AMZakatPoolGeneral` (shared pool) — 16 checks: pooled donation → ujrah split →
recipient registration → non-oracle distribute reverts → **a single oracle key
is rate-limited and cannot drain the pool** → `batchDistribute` accumulates
against the same allowance → only ADMIN can widen the limit → 100%-of-principal
accounting invariant → pause blocks donate *and* distribute.

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
2. **Donor** calls `donate(recipient, zakatAmount, maxUjrah)` after approving `zakatAmount + ujrah`. Zakat → escrow, ujrah → treasury. `maxUjrah` is the fee ceiling the donor accepts — pass the exact `quoteUjrah()` figure your UI showed them; the call reverts rather than charging more (see Known issues).
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
- Hard cap on ujrah (`MAX_UJRAH_BPS` = 2.5%), enforced on every tier
- **Donor-side fee bound**: `donate(..., maxUjrah)` reverts rather than charging
  more than the donor agreed to, even if ADMIN changes tiers mid-flight
- **Per-oracle rate limit on the shared pool** (`AMZakatPoolGeneral` only):
  `oracleDailyLimit` caps how much any single `ORACLE_ROLE` key can distribute
  per rolling 24h, so one compromised key cannot sweep the pool. ADMIN-adjustable
  via `setOracleDailyLimit`; check headroom with `oracleRemainingToday(oracle)`
- Score / category validation

## ⚠️ Before mainnet — this is a PROTOTYPE

Do **not** deploy with real funds until:

1. **Professional security audit** (e.g. OpenZeppelin, Trail of Bits, Halborn) — budgeted at $40k in the seed plan.
2. **Sharia advisory board sign-off** on the ujrah mechanics and the wakala structure.
3. **Multisig** (Gnosis Safe) holds `ADMIN_ROLE` — never a single private key.
4. Comprehensive **test suite** (Foundry/Hardhat) covering reentrancy, access control, edge cases.
5. **Testnet deployment** on Base Sepolia with real oracle dry-runs.

### Internal review — July 2026

An independent adversarial review found two real issues. **Both are now fixed
and covered by tests**, but the residual risk below still belongs in the
professional audit's scope.

**1. Shared-pool drain by a single oracle key — MITIGATED, not eliminated.**
In `AMZakatPoolGeneral`, `registerRecipient()` and `distribute()` are both gated
only by `ORACLE_ROLE`, and `distribute()` draws from the shared `poolBalance`
rather than a per-recipient escrow (unlike `AMZakatPool`, where `release()` is
bounded by that one recipient's `escrow`). One phished key could move 100% of
all general-pool donations in a single transaction.

*Fix:* `oracleDailyLimit` — a rolling 24h per-oracle cap (default 10,000 units),
charged on every distribution path including each iteration of
`batchDistribute`. Proven by test: with a 25,000 pool and a 10,000 limit, an
oracle's attempt to sweep the remaining 16,000 reverts and 15,000 stays out of
reach.

*Residual risk for the auditor:* this is a **circuit breaker, not consent** — it
converts instant total loss into rate-limited loss that ADMIN can stop with
`pause()` / `removeOracle()`. A patient attacker still extracts `limit` per day
until noticed, and ADMIN can raise the limit unilaterally. Real fixes to
evaluate: multi-oracle consensus (propose/confirm by *distinct* oracles), a
timelock on `setOracleDailyLimit`, and monitoring/alerting on
`Distributed` volume.

**2. Fee slippage on `donate()` — FIXED.** `ujrah` is read from live tier
storage at execution time, so a donor with an infinite ERC20 allowance (the
pattern this repo's own tests use) could be silently charged up to the 2.5% cap
if an ADMIN tier change landed before their transaction mined.

*Fix:* `donate()` now takes a required `maxUjrah` and reverts when the live quote
exceeds it. Proven by test: with the quote moved 30 → 50 mid-flight, the
30-bounded call reverts and only the explicitly re-accepted 50-bounded call
succeeds.

*Still open for the auditor:* `setUjrahTiers` and `setTreasury` have no timelock,
so ADMIN remains fully trusted for fee policy — the multisig requirement above
is doing that work, and should not be skipped.

**Also note:** `test/AMZakatPool.t.sol` (Foundry) is **not** run by `npm test` —
it needs `forge`, which isn't part of this toolchain. The 29 checks come from the
JS suites in `scripts/`. Whoever sets up CI should wire Foundry in so that file
stops silently rotting.

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
