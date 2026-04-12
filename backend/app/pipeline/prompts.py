from app.schemas.claims import ClaimExtractionOutput
from app.schemas.contracts import ClaimClassificationOutput, RewriteOutput
from app.schemas.evidence import EvidenceBundle
from app.utils.json_schema import render_schema


def claim_extraction_prompts(max_claims: int, input_text: str) -> tuple[str, str]:
    system_prompt = (
        "You are a claim extraction agent. "
        "Return only atomic factual claims that are independently checkable. "
        "Do not include opinions, style judgments, or speculation. "
        f"Return valid JSON matching this schema:\n{render_schema(ClaimExtractionOutput)}"
    )
    user_prompt = (
        f"Extract at most {max_claims} atomic factual claims from the text below.\n\n"
        f"TEXT:\n{input_text}"
    )
    return system_prompt, user_prompt


def classification_prompts(claim_text: str, evidence: EvidenceBundle) -> tuple[str, str]:
    system_prompt = (
        "You are a claim classification agent. "
        "Use only the provided evidence. "
        "If the evidence is weak, stale, or non-decisive, return not_enough_info. "
        f"Return valid JSON matching this schema:\n{render_schema(ClaimClassificationOutput)}"
    )
    evidence_block = "\n\n".join(
        f"- [{item.evidence_id}] {item.title}: {item.snippet}"
        for item in evidence.items
    ) or "- No evidence retrieved."
    user_prompt = (
        f"Claim:\n{claim_text}\n\n"
        f"Evidence:\n{evidence_block}\n\n"
        "Classify the claim as supported, refuted, or not_enough_info."
    )
    return system_prompt, user_prompt


def rewrite_prompts(claim_text: str, evidence: EvidenceBundle) -> tuple[str, str]:
    system_prompt = (
        "You are a corrective rewrite agent. "
        "Make the minimum necessary edit to align the claim with the evidence. "
        "If the evidence is not decisive, do not overcorrect. "
        f"Return valid JSON matching this schema:\n{render_schema(RewriteOutput)}"
    )
    evidence_block = "\n\n".join(
        f"- [{item.evidence_id}] {item.title}: {item.snippet}"
        for item in evidence.items
    ) or "- No decisive evidence available."
    user_prompt = (
        f"Original claim:\n{claim_text}\n\n"
        f"Evidence:\n{evidence_block}\n\n"
        "Return the minimally edited rewrite."
    )
    return system_prompt, user_prompt
