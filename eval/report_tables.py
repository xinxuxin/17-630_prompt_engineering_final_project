from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

try:
    from eval.eval_utils import markdown_table, write_csv
except ImportError:
    from eval_utils import markdown_table, write_csv


def build_report_tables(*, run_dirs: list[Path], output_root: Path) -> Path:
    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    output_dir = output_root / f"report_tables_{timestamp}"
    output_dir.mkdir(parents=True, exist_ok=True)

    rows = []
    for run_dir in run_dirs:
        summary = json.loads((run_dir / "summary.json").read_text(encoding="utf-8"))
        metrics = summary["metrics"]
        rows.append(
            {
                "mode": summary["mode"],
                "dataset_name": summary["dataset_name"],
                "dataset_track": ", ".join(summary.get("dataset_summary", {}).get("dataset_tracks", [])),
                "label_accuracy": metrics.get("label_accuracy"),
                "macro_f1": metrics.get("macro_f1"),
                "retrieval_recall_at_k": metrics.get("retrieval_recall_at_k"),
                "predicted_nei_rate": metrics["nei_usage"]["predicted_nei_rate"],
                "claims_scored": metrics.get("claims_scored"),
                "claims_total": metrics.get("claims_total"),
                "run_dir": str(run_dir),
            }
        )

    write_csv(output_dir / "summary_table.csv", rows)
    (output_dir / "summary_table.md").write_text(
        markdown_table(
            [
                "Mode",
                "Dataset",
                "Track",
                "Accuracy",
                "Macro F1",
                "Recall@K",
                "Pred NEI Rate",
                "Scored",
                "Total",
            ],
            [
                [
                    row["mode"],
                    row["dataset_name"],
                    row["dataset_track"],
                    row["label_accuracy"],
                    row["macro_f1"],
                    row["retrieval_recall_at_k"],
                    row["predicted_nei_rate"],
                    row["claims_scored"],
                    row["claims_total"],
                ]
                for row in rows
            ],
        ),
        encoding="utf-8",
    )
    return output_dir


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runs", nargs="+", required=True, type=Path)
    parser.add_argument("--output-root", default="eval/results", type=Path)
    args = parser.parse_args()

    output_dir = build_report_tables(run_dirs=args.runs, output_root=args.output_root)
    print(f"Report tables written to: {output_dir}")


if __name__ == "__main__":
    main()
