# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing
from datetime import datetime, timezone


class AlibiChain(gl.Contract):
    proof_count: i32
    proofs: TreeMap[str, str]

    def __init__(self):
        self.proof_count = i32(0)

    @gl.public.write.payable
    def request_proof(self, url: str, claim: str) -> i32:
        value = gl.message.value
        if value == u256(0):
            raise gl.vm.UserError("Must pay verification fee")

        self.proof_count = i32(int(self.proof_count) + 1)
        proof_id = str(int(self.proof_count))
        now = int(datetime.now(timezone.utc).timestamp())

        proof = {
            "id": proof_id,
            "requester": str(gl.message.sender_address),
            "url": url,
            "claim": claim,
            "fee": str(value),
            "status": 0,  # 0=pending, 1=verified, 2=rejected
            "verification": "",
            "timestamp": now,
        }
        self.proofs[proof_id] = json.dumps(proof)
        return self.proof_count

    @gl.public.write
    def verify_proof(self, proof_id: str) -> typing.Any:
        proof = json.loads(self.proofs[proof_id])
        if proof["status"] != 0:
            raise gl.vm.UserError("Already verified")

        url = proof["url"]
        claim = proof["claim"]

        def leader_fn():
            web_data = gl.nondet.web.get(url).body.decode("utf-8")
            prompt = f"""You are a factual verification agent. Check if the following claim is supported by the web page content.

URL: {url}
CLAIM: "{claim}"

PAGE CONTENT (first 3000 chars):
{web_data[:3000]}

Determine:
1. Does the page content support the claim?
2. What specific evidence from the page confirms or denies it?

Return JSON:
{{
    "verified": true or false,
    "confidence": 1-10,
    "evidence": "exact text or data from the page that supports/denies the claim",
    "summary": "brief explanation"
}}"""
            response = gl.nondet.exec_prompt(prompt)
            return json.loads(response)

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            validator_data = leader_fn()
            leader_data = leader_result.calldata
            return (leader_data["verified"] == validator_data["verified"]
                    and abs(leader_data["confidence"] - validator_data["confidence"]) <= 2)

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        proof["status"] = 1 if result["verified"] else 2
        proof["verification"] = json.dumps(result)
        self.proofs[proof_id] = json.dumps(proof)

    @gl.public.view
    def get_proof(self, proof_id: str) -> str:
        return self.proofs[proof_id]

    @gl.public.view
    def get_proof_count(self) -> i32:
        return self.proof_count
