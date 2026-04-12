from __future__ import annotations

from collections import Counter
from typing import Any


LABELS = ["supported", "refuted", "not_enough_info"]


def compute_metrics(claim_rows: list[dict[str, Any]], top_k: int) -> dict[str, Any]:
    scored_rows = [
        row
        for row in claim_rows
        if row.get("gold_label") in LABELS
    ]
    gold = [row["gold_label"] for row in scored_rows]
    predicted = [row["predicted_label"] for row in scored_rows]
    total = len(scored_rows)
    total_claims = len(claim_rows)
    correct = sum(1 for g, p in zip(gold, predicted, strict=False) if g == p)

    per_label = {
        label: _label_metrics(gold, predicted, label)
        for label in LABELS
    }

    eligible_retrieval_rows = [
        row for row in claim_rows if row.get("gold_source_document_ids") or row.get("gold_evidence_ids")
    ]
    retrieval_hits = 0
    for row in eligible_retrieval_rows:
        gold_ids = set(row.get("gold_source_document_ids", [])) | set(row.get("gold_evidence_ids", []))
        retrieved_ids = set(row.get("retrieved_source_document_ids", [])) | set(row.get("retrieved_evidence_ids", []))
        if gold_ids.intersection(retrieved_ids):
            retrieval_hits += 1

    predicted_counts = Counter(row["predicted_label"] for row in claim_rows)
    gold_counts = Counter(gold)

    macro_f1 = round(
        sum(metrics["f1"] for metrics in per_label.values()) / len(LABELS),
        4,
    )

    return {
        "claims_total": total_claims,
        "claims_scored": total,
        "claims_without_gold_labels": total_claims - total,
        "label_accuracy": round(correct / total, 4) if total else None,
        "macro_f1": macro_f1 if total else None,
        "per_label": per_label,
        "retrieval_recall_at_k": (
            round(retrieval_hits / len(eligible_retrieval_rows), 4)
            if eligible_retrieval_rows
            else None
        ),
        "retrieval_recall_at_k_k": top_k,
        "retrieval_recall_eligible_claims": len(eligible_retrieval_rows),
        "nei_usage": {
            "predicted_nei_count": predicted_counts["not_enough_info"],
            "predicted_nei_rate": round(predicted_counts["not_enough_info"] / total_claims, 4) if total_claims else None,
            "gold_nei_count": gold_counts["not_enough_info"],
            "gold_nei_rate": round(gold_counts["not_enough_info"] / total, 4) if total else None,
        },
        "predicted_label_distribution": dict(predicted_counts),
        "gold_label_distribution": dict(gold_counts),
    }


def _label_metrics(gold: list[str], predicted: list[str], label: str) -> dict[str, Any]:
    tp = sum(1 for g, p in zip(gold, predicted, strict=False) if g == label and p == label)
    fp = sum(1 for g, p in zip(gold, predicted, strict=False) if g != label and p == label)
    fn = sum(1 for g, p in zip(gold, predicted, strict=False) if g == label and p != label)

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
    support = sum(1 for g in gold if g == label)

    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "support": support,
    }
