from eval.metrics import compute_metrics


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
