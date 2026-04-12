import argparse
import json
from pathlib import Path

import yaml

from app.core.settings import get_settings
from app.schemas.pipeline import FactCheckRequest
from app.services.fact_check import FactCheckService


def load_jsonl(path: Path) -> list[dict[str, object]]:
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def evaluate(config_path: Path) -> Path:
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    dataset_path = Path(config["dataset_path"])
    dataset_name = config["dataset_name"]
    records = load_jsonl(dataset_path)

    service = FactCheckService(get_settings())
    example_results: list[dict[str, object]] = []
    total_expected = 0
    total_correct = 0

    for record in records:
        response = service.run(
            FactCheckRequest(
                input_text=str(record["input_text"]),
                dataset_name=dataset_name,
                include_rewrite=bool(config.get("include_rewrite", True)),
                max_claims=int(config.get("max_claims", 6)),
                top_k_evidence=int(config.get("top_k_evidence", 4)),
            )
        )

        expected_labels = record.get("expected_labels", [])
        predicted_labels = [claim["label"] for claim in response.model_dump()["claims"]]
        pairs = list(zip(expected_labels, predicted_labels, strict=False))
        total_expected += len(pairs)
        total_correct += sum(1 for expected, predicted in pairs if expected == predicted)

        example_results.append(
            {
                "example_id": record["example_id"],
                "predicted_labels": predicted_labels,
                "expected_labels": expected_labels,
                "summary": response.summary.model_dump(),
                "run_id": response.run_id,
            }
        )

    metrics = {
        "dataset_name": dataset_name,
        "examples": len(records),
        "label_accuracy": round(total_correct / total_expected, 4) if total_expected else None,
        "labels_scored": total_expected,
    }

    output_dir = Path(config.get("output_dir", "eval/results"))
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"evaluation_{dataset_name}.json"
    output_path.write_text(
        json.dumps({"config": config, "metrics": metrics, "examples": example_results}, indent=2),
        encoding="utf-8",
    )
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, help="Path to an evaluation YAML file.")
    args = parser.parse_args()

    output_path = evaluate(Path(args.config))
    print(f"Evaluation complete: {output_path}")


if __name__ == "__main__":
    main()
