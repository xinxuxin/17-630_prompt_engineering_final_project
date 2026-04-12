import argparse
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
if str(REPO_ROOT / "eval") not in sys.path:
    sys.path.insert(0, str(REPO_ROOT / "eval"))

from eval.run_baseline import run_baseline
from eval.run_multistage import run_multistage


def evaluate(config_path: Path) -> Path:
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    dataset_path = Path(config["dataset_path"])
    if not dataset_path.is_absolute():
        dataset_path = REPO_ROOT / dataset_path
    dataset_name = config["dataset_name"]
    output_dir = Path(config.get("output_dir", "eval/results"))
    if not output_dir.is_absolute():
        output_dir = REPO_ROOT / output_dir
    mode = str(config.get("mode", "multistage")).strip().lower()

    if mode == "baseline":
        return run_baseline(
            dataset_path=dataset_path,
            dataset_name=dataset_name,
            output_root=output_dir,
            top_k=int(config.get("top_k_evidence", 4)),
        )

    return run_multistage(
        dataset_path=dataset_path,
        dataset_name=dataset_name,
        output_root=output_dir,
        top_k=int(config.get("top_k_evidence", 4)),
        max_claims=int(config.get("max_claims", 6)),
        include_rewrite=bool(config.get("include_rewrite", True)),
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, help="Path to an evaluation YAML file.")
    args = parser.parse_args()

    output_path = evaluate(Path(args.config))
    print(f"Evaluation complete: {output_path}")


if __name__ == "__main__":
    main()
