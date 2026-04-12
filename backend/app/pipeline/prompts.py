from pathlib import Path

from app.schemas.claims import ClaimExtractionOutput, QueryGenerationOutput
from app.schemas.correction import CorrectionRewriteOutput
from app.schemas.evidence import EvidenceItem
from app.schemas.verification import VerificationOutput
from app.utils.json_schema import render_schema

TEMPLATE_ROOT = Path(__file__).with_name("prompt_templates")


def _load_template(filename: str) -> str:
    return (TEMPLATE_ROOT / filename).read_text(encoding="utf-8")


def _render_template(filename: str, **kwargs: object) -> str:
    return _load_template(filename).format(**kwargs)


def _evidence_block(items: list[EvidenceItem]) -> str:
    return "\n\n".join(
        f"- [{item.evidence_id}] {item.title}: {item.snippet}"
        for item in items
    ) or "- No evidence retrieved."


def claim_extraction_prompts(max_claims: int, input_text: str) -> tuple[str, str]:
    return (
        _render_template(
            "claim_extractor.system.md",
            response_schema=render_schema(ClaimExtractionOutput),
        ),
        _render_template(
            "claim_extractor.user.md",
            max_claims=max_claims,
            input_text=input_text,
        ),
    )


def query_generation_prompts(claim_text: str) -> tuple[str, str]:
    return (
        _render_template(
            "query_generator.system.md",
            response_schema=render_schema(QueryGenerationOutput),
        ),
        _render_template("query_generator.user.md", claim_text=claim_text),
    )


def verification_prompts(claim_text: str, evidence_items: list[EvidenceItem]) -> tuple[str, str]:
    return (
        _render_template(
            "verifier.system.md",
            response_schema=render_schema(VerificationOutput),
        ),
        _render_template(
            "verifier.user.md",
            claim_text=claim_text,
            evidence_block=_evidence_block(evidence_items),
        ),
    )


def correction_prompts(
    claim_text: str,
    label: str,
    evidence_items: list[EvidenceItem],
) -> tuple[str, str]:
    return (
        _render_template(
            "correction_rewriter.system.md",
            response_schema=render_schema(CorrectionRewriteOutput),
        ),
        _render_template(
            "correction_rewriter.user.md",
            claim_text=claim_text,
            label=label,
            evidence_block=_evidence_block(evidence_items),
        ),
    )
