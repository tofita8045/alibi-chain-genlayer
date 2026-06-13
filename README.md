# 🔏 AlibiChain

**Tamper-proof evidence, verified by AI, stored forever.**

Claim something happened online  a price, a statement, a page existing  and AlibiChain's AI validators will fetch the URL, check your claim against the actual content, and stamp the result on-chain. Immutable proof that holds up.

---

## The Problem

The internet changes. Prices move. Tweets get deleted. Websites edit their claims. When you need to prove what was online at a specific moment — for a legal dispute, a trade gone wrong, or just a bet with a friend — screenshots don't cut it. They're easy to fake and impossible to verify.

AlibiChain solves this by creating decentralized, AI-verified, on-chain proof of web content.

---

## How It Works

1. **Submit a Claim** — Provide a URL and state what you believe is on that page (e.g., "BTC is above $100k on this exchange")
2. **Pay Verification Fee** — Stake a small amount of GEN to cover validator costs
3. **AI Validators Fetch & Verify** — Multiple AI nodes independently:
   - Fetch the actual web page content
   - Read and understand the page
   - Check if your claim matches reality
   - Vote on verified/rejected with confidence score
4. **Result Stored On-Chain** — The verdict, evidence, and timestamp are permanently recorded

---

## Use Cases

- **Trading disputes** — Prove a price was displayed at a specific time
- **Legal evidence** — Capture claims before they get edited or deleted
- **Social media proof** — Verify someone posted something publicly
- **Compliance records** — Record regulatory information at point in time
- **Contract disputes** — Prove terms were listed on a service's website
- **Journalism** — Archive claims by public figures before they backtrack
- **Bets and arguments** — Settle "I told you so" with on-chain receipts

---

## Why GenLayer?

Verifying web content requires two things traditional blockchains can't do:

1. **Fetching live web data** — GenLayer contracts use `gl.nondet.web.get()` to access any URL
2. **Understanding content** — AI validators read the page and determine if a claim holds up

Multiple AI models verify independently and must agree (verified field matches + confidence within ±2) for the proof to be stamped. No single point of failure, no trust in one oracle.

---

## Deployed Contract

**Network:** GenLayer Studionet  
**Address:** `0x5e28F39B5b0E74FD1FAbEc1fa50159F7258cb16A`  
**Consensus:** 5/5 validators agreed on deployment

---

## Project Structure

```
alibi-chain-genlayer/
├── contracts/
│   └── alibi_chain.py       # Intelligent Contract
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx     # UI for requesting & viewing proofs
│   │   └── lib/
│   │       └── genlayer.ts  # SDK config
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

---

## Quick Start

```bash
# Install GenLayer CLI
npm install -g genlayer

# Deploy (or use the already-deployed address above)
genlayer network set studionet
genlayer account create --name prover --password "yourpass"
genlayer account unlock --password "yourpass"
genlayer deploy --contract contracts/alibi_chain.py

# Run frontend
cd frontend
npm install
# Add contract address to .env.local
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x5e28F39B5b0E74FD1FAbEc1fa50159F7258cb16A" > .env.local
npm run dev
```

---

## Contract Methods

| Method | Type | Description |
|--------|------|-------------|
| `request_proof(url, claim)` | payable | Submit URL + claim with verification fee |
| `verify_proof(proof_id)` | write (AI) | Triggers AI verification — fetches page, checks claim |
| `get_proof(proof_id)` | view | Get proof details and verification result |
| `get_proof_count()` | view | Total proofs requested |

---

## How Verification Works Under the Hood

```
request_proof("https://exchange.com/btc", "BTC price is above $100k")
                            │
                            ▼
                    verify_proof("1")
                            │
                            ▼
              ┌─────────────────────────────┐
              │         LEADER NODE         │
              │                             │
              │  1. Fetches URL content     │
              │  2. Reads page (first 3000  │
              │     chars)                  │
              │  3. Asks LLM: does content  │
              │     support the claim?      │
              │  4. Returns:               │
              │     verified: true          │
              │     confidence: 9           │
              │     evidence: "BTC/USD:     │
              │       $102,450"             │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │      VALIDATOR NODES        │
              │                             │
              │  Same process independently │
              │  Check:                     │
              │  • verified matches? ✓      │
              │  • confidence within ±2? ✓  │
              │                             │
              │  Vote: AGREE                │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  Result stored on-chain:    │
              │  • Status: VERIFIED ✓       │
              │  • Timestamp: 2026-06-13    │
              │  • Evidence: "BTC/USD:      │
              │    $102,450"                │
              │  • Confidence: 9/10         │
              │  • Immutable forever        │
              └─────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Python (GenLayer Intelligent Contract) |
| Web Access | `gl.nondet.web.get()` — fetches live URLs |
| AI Consensus | `gl.vm.run_nondet_unsafe` with partial field matching |
| Frontend | Next.js + TypeScript |
| SDK | GenLayerJS |

---

## Example

```bash
# Request proof that GenLayer docs exist
genlayer write --contract 0x5e28F39... request_proof \
  "https://docs.genlayer.com" \
  "This is the official GenLayer documentation site" \
  --fee-value 1000000000000000000

# Trigger verification
genlayer write --contract 0x5e28F39... verify_proof "1"

# Check result
genlayer call --contract 0x5e28F39... get_proof "1"
# → {"verified": true, "confidence": 10, "evidence": "GenLayer Documentation...", ...}
```

---

## License

MIT
