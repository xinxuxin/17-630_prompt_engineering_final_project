from __future__ import annotations

import csv
import json
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.utils.text import split_compound_claim, split_into_sentences

try:
    from eval.recent_claims import load_curated_recent_claims
except ImportError:
    from recent_claims import load_curated_recent_claims


@dataclass(slots=True)
class EvalClaim:
    claim_id: str
    text: str
    gold_label: str | None = None
    gold_evidence_ids: list[str] = field(default_factory=list)
    gold_source_document_ids: list[str] = field(default_factory=list)
    source_article_title: str | None = None
    publication_date: str | None = None
    source_url: str | None = None
    notes: str | None = None


@dataclass(slots=True)
class EvalExample:
    example_id: str
    input_text: str
    claims: list[EvalClaim]
    metadata: dict[str, Any] = field(default_factory=dict)


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def normalize_examples(dataset_path: Path) -> list[EvalExample]:
    if dataset_path.is_dir():
        recent_claims = load_curated_recent_claims(dataset_path)
        return [normalize_recent_claim(claim) for claim in recent_claims]

    records = load_jsonl(dataset_path)
    if records and any("claim_text" in record for record in records):
        recent_claims = load_curated_recent_claims(dataset_path)
        return [normalize_recent_claim(claim) for claim in recent_claims]
    return [normalize_example(record) for record in records]


def normalize_example(record: dict[str, Any]) -> EvalExample:
    if "claims" in record:
        claims = [
            EvalClaim(
                claim_id=claim.get("claim_id", f"gold_claim_{index + 1:03d}"),
                text=claim["text"],
                gold_label=claim["label"],
                gold_evidence_ids=claim.get("gold_evidence_ids", []),
                gold_source_document_ids=claim.get("gold_source_document_ids", []),
            )
            for index, claim in enumerate(record["claims"])
        ]
    else:
        extracted_claims = _fallback_extract_claims(str(record["input_text"]))
        expected_labels = record.get("expected_labels", [])
        claims = []
        for index, claim_text in enumerate(extracted_claims):
            gold_label = (
                expected_labels[index]
                if index < len(expected_labels)
                else "not_enough_info"
            )
            claims.append(
                EvalClaim(
                    claim_id=f"gold_claim_{index + 1:03d}",
                    text=claim_text,
                    gold_label=gold_label,
                )
            )

    metadata = {
        key: value
        for key, value in record.items()
        if key not in {"example_id", "input_text", "claims", "expected_labels"}
    }
    return EvalExample(
        example_id=record["example_id"],
        input_text=record["input_text"],
        claims=claims,
        metadata=metadata,
    )


def normalize_recent_claim(record) -> EvalExample:
    label = record.gold_label.value if record.gold_label else None
    claim = EvalClaim(
        claim_id=record.claim_id,
        text=record.claim_text,
        gold_label=label,
        gold_evidence_ids=record.gold_evidence_ids,
        gold_source_document_ids=record.gold_source_document_ids,
        source_article_title=record.source_article_title,
        publication_date=record.publication_date.isoformat(),
        source_url=record.source_url,
        notes=record.notes,
    )
    input_text = record.input_text or record.claim_text
    return EvalExample(
        example_id=record.claim_id,
        input_text=input_text,
        claims=[claim],
        metadata={
            "dataset_track": "curated_recent_news",
            "source_article_title": record.source_article_title,
            "publication_date": record.publication_date.isoformat(),
            "source_url": record.source_url,
            "notes": record.notes,
            **record.metadata,
        },
    )


def create_run_dir(output_root: Path, mode: str, dataset_name: str) -> Path:
    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    run_dir = output_root / f"{mode}_{dataset_name}_{timestamp}"
    run_dir.mkdir(parents=True, exist_ok=True)
    return run_dir


def write_json(path: Path, payload: Any) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return path


def write_csv(path: Path, rows: list[dict[str, Any]]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return path
    fieldnames = list(rows[0].keys())
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return path


def markdown_table(headers: list[str], rows: list[list[Any]]) -> str:
    header_line = "| " + " | ".join(headers) + " |"
    separator = "| " + " | ".join(["---"] * len(headers)) + " |"
    body = [
        "| " + " | ".join(str(cell) for cell in row) + " |"
        for row in rows
    ]
    return "\n".join([header_line, separator, *body]) + "\n"


def claim_to_dict(claim: EvalClaim) -> dict[str, Any]:
    return asdict(claim)


def summarize_examples(examples: list[EvalExample]) -> dict[str, Any]:
    dataset_tracks = sorted(
        {
            example.metadata.get("dataset_track", "benchmark_style")
            for example in examples
        }
    )
    total_claims = sum(len(example.claims) for example in examples)
    claims_with_gold = sum(
        1
        for example in examples
        for claim in example.claims
        if claim.gold_label is not None
    )
    return {
        "dataset_tracks": dataset_tracks,
        "examples": len(examples),
        "claims_total": total_claims,
        "claims_with_gold_labels": claims_with_gold,
        "claims_without_gold_labels": total_claims - claims_with_gold,
    }


def _fallback_extract_claims(text: str) -> list[str]:
    claims: list[str] = []
    for sentence, _start, _end in split_into_sentences(text):
        for candidate in split_compound_claim(sentence):
            if len(candidate) >= 20:
                claims.append(candidate)
    return claims
