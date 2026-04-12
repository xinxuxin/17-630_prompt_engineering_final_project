from pathlib import Path

from app.schemas.pipeline import FactCheckResponse


def write_experiment_output(eval_root: Path, response: FactCheckResponse) -> Path:
    output_dir = eval_root / "results"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{response.run_id}.json"
    output_path.write_text(response.model_dump_json(indent=2), encoding="utf-8")
    return output_path
