# 🔏 AlibiChain

**Tamper-proof evidence, verified by AI, stored forever.**

Claim something happened online — a price, a statement, a page existing — and AlibiChain's AI validators will fetch the URL, check your claim against the actual content, and stamp the result on-chain. Immutable proof that holds up.

---

## Use Cases

- Prove a price was displayed at a specific time (trading disputes)
- Capture that a website made a claim before they edit it
- Verify someone posted something on social media
- Record regulatory compliance evidence
- Settle "I told you so" arguments with on-chain receipts

---

## How It Works

1. Submit a URL + your claim about what's on that page
2. Pay a small verification fee
3. AI validators fetch the URL, read the content, and check your claim
4. Result stored on-chain: verified or rejected, with evidence

---

## Stack

| Layer | Tech |
|-------|------|
| Contract | Python — GenLayer Intelligent Contract |
| Web Access | `gl.nondet.web.get()` fetches live pages |
| Consensus | `run_nondet_unsafe` — validators independently verify |
| Frontend | Next.js + GenLayerJS |

---

## Quick Start

```bash
npm install -g genlayer
genlayer network set studionet
genlayer deploy --contract contracts/alibi_chain.py

cd frontend && npm install && npm run dev
```

---

## License

MIT
