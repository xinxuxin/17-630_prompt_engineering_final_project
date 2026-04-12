from pathlib import Path

from app.schemas.evidence import EvidenceItem
from app.pipeline.prompt_manager import PromptManager, render_evidence_block

TEMPLATE_ROOT = Path(__file__).with_name("prompt_templates")
PROMPT_MANAGER = PromptManager(TEMPLATE_ROOT)

def claim_extraction_prompts(max_claims: int, input_text: str) -> tuple[str, str]:
    bundle = PROMPT_MANAGER.render(
        "claim_extraction",
        max_claims=max_claims,
        input_text=input_text,
    )
    return bundle.system_prompt, bundle.user_prompt


def query_generation_prompts(claim_text: str) -> tuple[str, str]:
    bundle = PROMPT_MANAGER.render("query_generation", claim_text=claim_text)
    return bundle.system_prompt, bundle.user_prompt


def verification_prompts(claim_text: str, evidence_items: list[EvidenceItem]) -> tuple[str, str]:
    bundle = PROMPT_MANAGER.render(
        "verification",
        claim_text=claim_text,
        evidence_block=render_evidence_block(evidence_items),
    )
    return bundle.system_prompt, bundle.user_prompt


def correction_prompts(
    claim_text: str,
    label: str,
    evidence_items: list[EvidenceItem],
) -> tuple[str, str]:
    bundle = PROMPT_MANAGER.render(
        "correction_rewrite",
        claim_text=claim_text,
        label=label,
        evidence_block=render_evidence_block(evidence_items),
    )
    return bundle.system_prompt, bundle.user_prompt
