from __future__ import annotations

import csv
import json
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.utils.text import split_compound_claim, split_into_sentences


@dataclass(slots=True)
class EvalClaim:
    claim_id: str
    text: str
    gold_label: str
    gold_evidence_ids: list[str] = field(default_factory=list)
    gold_source_document_ids: list[str] = field(default_factory=list)


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
    records = load_jsonl(dataset_path)
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


def _fallback_extract_claims(text: str) -> list[str]:
    claims: list[str] = []
    for sentence, _start, _end in split_into_sentences(text):
        for candidate in split_compound_claim(sentence):
            if len(candidate) >= 20:
                claims.append(candidate)
    return claims
