from pathlib import Path

from eval.metrics import compute_metrics
from eval.eval_utils import normalize_examples


def test_compute_metrics_returns_accuracy_macro_f1_and_recall() -> None:
    rows = [
        {
            "gold_label": "supported",
            "predicted_label": "supported",
            "gold_source_document_ids": ["doc_a"],
            "gold_evidence_ids": [],
            "retrieved_source_document_ids": ["doc_a"],
            "retrieved_evidence_ids": ["doc_a::chunk_000"],
        },
        {
            "gold_label": "refuted",
            "predicted_label": "not_enough_info",
            "gold_source_document_ids": ["doc_b"],
            "gold_evidence_ids": [],
            "retrieved_source_document_ids": ["doc_c"],
            "retrieved_evidence_ids": ["doc_c::chunk_000"],
        },
        {
            "gold_label": "not_enough_info",
            "predicted_label": "not_enough_info",
            "gold_source_document_ids": [],
            "gold_evidence_ids": [],
            "retrieved_source_document_ids": [],
            "retrieved_evidence_ids": [],
        },
    ]

    metrics = compute_metrics(rows, top_k=4)

    assert metrics["claims_scored"] == 3
    assert metrics["label_accuracy"] == 0.6667
    assert metrics["retrieval_recall_at_k"] == 0.5
    assert metrics["nei_usage"]["predicted_nei_count"] == 2
    assert metrics["macro_f1"] is not None


def test_compute_metrics_skips_unlabeled_claims_for_scoring() -> None:
    rows = [
        {
            "gold_label": "supported",
            "predicted_label": "supported",
            "gold_source_document_ids": [],
            "gold_evidence_ids": [],
            "retrieved_source_document_ids": [],
            "retrieved_evidence_ids": [],
        },
        {
            "gold_label": None,
            "predicted_label": "not_enough_info",
            "gold_source_document_ids": [],
            "gold_evidence_ids": [],
            "retrieved_source_document_ids": [],
            "retrieved_evidence_ids": [],
        },
    ]

    metrics = compute_metrics(rows, top_k=4)

    assert metrics["claims_total"] == 2
    assert metrics["claims_scored"] == 1
    assert metrics["claims_without_gold_labels"] == 1
    assert metrics["label_accuracy"] == 1.0
    assert metrics["nei_usage"]["predicted_nei_rate"] == 0.5


def test_normalize_examples_supports_curated_recent_claim_directories() -> None:
    examples = normalize_examples(
        Path("/Users/macbook/Desktop/17-630 prompt engineering final project/data/recent_news/curated_examples")
    )

    assert len(examples) == 4
    assert examples[0].metadata["dataset_track"] == "curated_recent_news"
    assert examples[0].claims[0].source_article_title is not None
    assert any(example.claims[0].gold_label is None for example in examples)
