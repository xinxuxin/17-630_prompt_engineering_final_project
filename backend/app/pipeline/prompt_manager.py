from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from app.schemas.claims import ClaimExtractionOutput, QueryGenerationOutput
from app.schemas.correction import CorrectionRewriteOutput
from app.schemas.evidence import EvidenceItem
from app.schemas.verification import VerificationOutput
from app.utils.json_schema import render_schema


@dataclass(frozen=True, slots=True)
class PromptTemplateSpec:
    stage: str
    version: str
    system_template: str
    user_template: str
    response_model: type[BaseModel]
    description: str


@dataclass(frozen=True, slots=True)
class PromptBundle:
    stage: str
    version: str
    system_prompt: str
    user_prompt: str
    response_model: type[BaseModel]
    description: str


class PromptManager:
    """Central registry for rendering stage prompts with explicit schema contracts."""

    def __init__(self, template_root: Path) -> None:
        self.template_root = template_root
        self._registry: dict[str, PromptTemplateSpec] = {
            "claim_extraction": PromptTemplateSpec(
                stage="claim_extraction",
                version="v1",
                system_template="claim_extractor.system.md",
                user_template="claim_extractor.user.md",
                response_model=ClaimExtractionOutput,
                description="Extract atomic, checkable factual claims from raw text.",
            ),
            "query_generation": PromptTemplateSpec(
                stage="query_generation",
                version="v1",
                system_template="query_generator.system.md",
                user_template="query_generator.user.md",
                response_model=QueryGenerationOutput,
                description="Turn one atomic claim into a retrieval-oriented query.",
            ),
            "verification": PromptTemplateSpec(
                stage="verification",
                version="v1",
                system_template="verifier.system.md",
                user_template="verifier.user.md",
                response_model=VerificationOutput,
                description="Assign supported, refuted, or not_enough_info from evidence only.",
            ),
            "correction_rewrite": PromptTemplateSpec(
                stage="correction_rewrite",
                version="v1",
                system_template="correction_rewriter.system.md",
                user_template="correction_rewriter.user.md",
                response_model=CorrectionRewriteOutput,
                description="Produce a minimal, citation-aware corrective rewrite.",
            ),
        }

    def render(self, stage: str, **context: object) -> PromptBundle:
        spec = self._registry[stage]
        shared_context = {
            "response_schema": render_schema(spec.response_model),
            **context,
        }
        return PromptBundle(
            stage=spec.stage,
            version=spec.version,
            system_prompt=self._render_file(spec.system_template, **shared_context),
            user_prompt=self._render_file(spec.user_template, **shared_context),
            response_model=spec.response_model,
            description=spec.description,
        )

    def list_specs(self) -> list[PromptTemplateSpec]:
        return list(self._registry.values())

    def _render_file(self, filename: str, **context: object) -> str:
        return (self.template_root / filename).read_text(encoding="utf-8").format(**context)


def render_evidence_block(items: list[EvidenceItem]) -> str:
    return "\n\n".join(
        (
            f"- [{item.evidence_id}] title={item.title}\n"
            f"  snippet={item.snippet}\n"
            f"  source_document_id={item.source_document_id}\n"
            f"  published_at={item.published_at}\n"
            f"  url={item.url}"
        )
        for item in items
    ) or "- No evidence retrieved."
