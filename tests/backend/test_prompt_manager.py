from app.pipeline.prompt_manager import PromptManager
from app.pipeline.prompts import TEMPLATE_ROOT


def test_prompt_manager_renders_claim_extraction_prompt() -> None:
    manager = PromptManager(TEMPLATE_ROOT)
    bundle = manager.render(
        "claim_extraction",
        max_claims=4,
        input_text="Riverdale University said the project cost $4 million.",
    )

    assert bundle.stage == "claim_extraction"
    assert bundle.version == "v1"
    assert "Return JSON only" in bundle.system_prompt
    assert "Extract at most 4 atomic factual claims" in bundle.user_prompt


def test_prompt_manager_renders_verification_prompt_with_nei_guardrail() -> None:
    manager = PromptManager(TEMPLATE_ROOT)
    bundle = manager.render(
        "verification",
        claim_text="The project received no state funding.",
        evidence_block="- [doc_1] title=Grant Announcement\n  snippet=The project received a state grant.",
    )

    assert "not_enough_info" in bundle.system_prompt
    assert "use only the supplied evidence" in bundle.system_prompt.lower()
    assert "Evidence:" in bundle.user_prompt
