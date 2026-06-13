"use client";
import { useState, useEffect } from "react";
import { client, CONTRACT_ADDRESS } from "@/lib/genlayer";

type Proof = {
  id: string; requester: string; url: string; claim: string;
  fee: string; status: number; verification: string; timestamp: number;
};

const STATUS = ["Pending", "Verified ✓", "Rejected ✗"];
const COLORS = ["#ff9800", "#4caf50", "#f44336"];

export default function Home() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"browse" | "create">("browse");
  const [selected, setSelected] = useState<Proof | null>(null);
  const [form, setForm] = useState({ url: "", claim: "", fee: "1" });
  const [tx, setTx] = useState("");

  useEffect(() => { if (CONTRACT_ADDRESS) load(); }, []);

  async function load() {
    try {
      const count = Number(await client.readContract({ address: CONTRACT_ADDRESS as `0x${string}`, functionName: "get_proof_count", args: [] }));
      const loaded: Proof[] = [];
      for (let i = 1; i <= count; i++) {
        const raw = await client.readContract({ address: CONTRACT_ADDRESS as `0x${string}`, functionName: "get_proof", args: [String(i)] });
        loaded.push(JSON.parse(raw as string));
      }
      setProofs(loaded);
    } catch (e) { console.error(e); }
  }

  async function send(fn: string, args: any[], value?: bigint) {
    setLoading(true); setTx(`${fn}...`);
    try {
      const hash = await client.writeContract({ address: CONTRACT_ADDRESS as `0x${string}`, functionName: fn, args, ...(value ? { value } : {}) });
      await client.waitForTransactionReceipt({ hash });
      setTx("✓ Done!"); await load(); setSelected(null);
    } catch (e: any) { setTx(`Error: ${e.message}`); }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ textAlign: "center" }}>🔏 AlibiChain</h1>
      <p style={{ textAlign: "center", color: "#888" }}>Tamper-proof on-chain evidence. AI validators verify web claims.</p>

      {tx && <div style={{ background: "#1a1a2e", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{tx}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button onClick={() => { setTab("browse"); setSelected(null); }} style={tabBtn(tab === "browse")}>Proofs</button>
        <button onClick={() => { setTab("create"); setSelected(null); }} style={tabBtn(tab === "create")}>Request Proof</button>
      </div>

      {tab === "create" && (
        <form onSubmit={e => { e.preventDefault(); send("request_proof", [form.url, form.claim], BigInt(form.fee) * BigInt(10**18)); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="URL to verify (https://...)" value={form.url} onChange={e => setForm({...form, url: e.target.value})} required style={inp} />
          <textarea placeholder="Your claim about this URL (e.g. 'BTC price was above $100k on this page')" value={form.claim} onChange={e => setForm({...form, claim: e.target.value})} required rows={2} style={inp} />
          <input placeholder="Verification fee (GEN)" type="number" min="1" value={form.fee} onChange={e => setForm({...form, fee: e.target.value})} required style={inp} />
          <button type="submit" disabled={loading} style={btn}>🔏 Request Proof</button>
        </form>
      )}

      {tab === "browse" && !selected && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {proofs.length === 0 && <p style={{ color: "#888" }}>No proofs yet.</p>}
          {proofs.map(p => (
            <div key={p.id} onClick={() => setSelected(p)} style={{ background: "#1a1a2e", padding: 16, borderRadius: 8, cursor: "pointer", border: "1px solid #333" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 14 }}>#{p.id} — {p.claim.slice(0, 60)}{p.claim.length > 60 ? "..." : ""}</p>
                <span style={{ background: COLORS[p.status], padding: "4px 10px", borderRadius: 12, fontSize: 12 }}>{STATUS[p.status]}</span>
              </div>
              <small style={{ color: "#666" }}>{p.url.slice(0, 50)}...</small>
            </div>
          ))}
        </div>
      )}

      {tab === "browse" && selected && (
        <div style={{ background: "#1a1a2e", padding: 24, borderRadius: 12, border: "1px solid #333" }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#6c5ce7", cursor: "pointer" }}>← Back</button>
          <h3>Proof #{selected.id}</h3>
          <span style={{ background: COLORS[selected.status], padding: "4px 10px", borderRadius: 12, fontSize: 12 }}>{STATUS[selected.status]}</span>

          <div style={{ marginTop: 16, fontSize: 14, display: "grid", gap: 8 }}>
            <div><strong>URL:</strong> <a href={selected.url} style={{ color: "#6c5ce7" }}>{selected.url}</a></div>
            <div><strong>Claim:</strong> {selected.claim}</div>
            <div><strong>Requested:</strong> {new Date(selected.timestamp * 1000).toLocaleString()}</div>
            <div><strong>Requester:</strong> {selected.requester.slice(0, 14)}...</div>
          </div>

          {selected.verification && (
            <div style={{ marginTop: 16, background: selected.status === 1 ? "#1a2a1a" : "#2a1a1a", padding: 12, borderRadius: 8 }}>
              <strong>📋 Verification Result:</strong>
              {(() => { const v = JSON.parse(selected.verification); return <><p>Confidence: {v.confidence}/10</p><p>Evidence: {v.evidence}</p><p>Summary: {v.summary}</p></>; })()}
            </div>
          )}

          {selected.status === 0 && (
            <button onClick={() => send("verify_proof", [selected.id])} disabled={loading} style={{ ...btn, marginTop: 16 }}>🔍 Trigger AI Verification</button>
          )}
        </div>
      )}
    </div>
  );
}

const inp: React.CSSProperties = { padding: 12, borderRadius: 8, border: "1px solid #333", background: "#1a1a2e", color: "#e0e0e0", fontSize: 14 };
const btn: React.CSSProperties = { padding: "12px 20px", borderRadius: 8, border: "none", background: "#6c5ce7", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: "bold" };
const tabBtn = (a: boolean): React.CSSProperties => ({ padding: "10px 20px", background: a ? "#6c5ce7" : "#2d2d2d", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer" });
