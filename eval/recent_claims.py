from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from pydantic import Field, field_validator

from app.schemas.common import StrictModel, VerdictLabel


class CuratedRecentClaimEntry(StrictModel):
    claim_id: str = Field(min_length=3)
    claim_text: str = Field(min_length=12)
    source_article_title: str = Field(min_length=3)
    publication_date: date
    source_url: str = Field(min_length=8)
    gold_label: VerdictLabel | None = None
    notes: str | None = None
    input_text: str | None = None
    gold_evidence_ids: list[str] = Field(default_factory=list)
    gold_source_document_ids: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("source_url")
    @classmethod
    def validate_source_url(cls, value: str) -> str:
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            msg = "source_url must be a valid absolute HTTP(S) URL."
            raise ValueError(msg)
        return value


def load_curated_recent_claims(dataset_path: Path) -> list[CuratedRecentClaimEntry]:
    records: list[CuratedRecentClaimEntry] = []
    for file_path in _resolve_jsonl_files(dataset_path):
        for line in file_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            payload = json.loads(line)
            records.append(CuratedRecentClaimEntry.model_validate(payload))
    return records


def _resolve_jsonl_files(dataset_path: Path) -> list[Path]:
    if dataset_path.is_file():
        return [dataset_path]
    return sorted(
        path
        for path in dataset_path.glob("*.jsonl")
        if path.is_file()
    )
