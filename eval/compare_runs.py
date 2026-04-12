from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

from eval_utils import markdown_table, write_csv, write_json


def compare_runs(*, baseline_run: Path, multistage_run: Path, output_root: Path) -> Path:
    baseline_summary = json.loads((baseline_run / "summary.json").read_text(encoding="utf-8"))
    multistage_summary = json.loads((multistage_run / "summary.json").read_text(encoding="utf-8"))

    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    output_dir = output_root / f"comparison_{timestamp}"
    output_dir.mkdir(parents=True, exist_ok=True)

    metrics_to_compare = [
        ("label_accuracy", "Label Accuracy"),
        ("macro_f1", "Macro F1"),
        ("retrieval_recall_at_k", "Retrieval Recall@K"),
        ("predicted_nei_rate", "Predicted NEI Rate"),
    ]

    baseline_metrics = baseline_summary["metrics"]
    multistage_metrics = multistage_summary["metrics"]
    rows = []
    for key, label in metrics_to_compare:
        baseline_value = (
            baseline_metrics["nei_usage"]["predicted_nei_rate"]
            if key == "predicted_nei_rate"
            else baseline_metrics.get(key)
        )
        multistage_value = (
            multistage_metrics["nei_usage"]["predicted_nei_rate"]
            if key == "predicted_nei_rate"
            else multistage_metrics.get(key)
        )
        delta = (
            round((multistage_value or 0) - (baseline_value or 0), 4)
            if baseline_value is not None and multistage_value is not None
            else None
        )
        rows.append(
            {
                "metric": label,
                "baseline": baseline_value,
                "multistage": multistage_value,
                "delta_multistage_minus_baseline": delta,
            }
        )

    comparison = {
        "baseline_run": str(baseline_run),
        "multistage_run": str(multistage_run),
        "rows": rows,
        "baseline_summary": baseline_summary,
        "multistage_summary": multistage_summary,
    }

    write_json(output_dir / "comparison.json", comparison)
    write_csv(output_dir / "comparison.csv", rows)
    (output_dir / "comparison.md").write_text(
        markdown_table(
            ["Metric", "Baseline", "Multi-stage", "Delta"],
            [
                [row["metric"], row["baseline"], row["multistage"], row["delta_multistage_minus_baseline"]]
                for row in rows
            ],
        ),
        encoding="utf-8",
    )
    return output_dir


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline-run", required=True, type=Path)
    parser.add_argument("--multistage-run", required=True, type=Path)
    parser.add_argument("--output-root", default="eval/results", type=Path)
    args = parser.parse_args()

    output_dir = compare_runs(
        baseline_run=args.baseline_run,
        multistage_run=args.multistage_run,
        output_root=args.output_root,
    )
    print(f"Run comparison written to: {output_dir}")


if __name__ == "__main__":
    main()
