from pathlib import Path

from app.core.settings import Settings
from app.schemas.common import VerdictLabel
from app.schemas.pipeline import FactCheckRequest
from app.services.fact_check import FactCheckService


def test_fact_check_service_runs_end_to_end(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    settings = Settings(
        fact_check_data_root=repo_root / "data",
        fact_check_eval_root=tmp_path / "eval",
        corpus_path=repo_root / "data" / "corpus" / "documents.jsonl",
        retrieval_index_path=tmp_path / "faiss.index",
    )
    service = FactCheckService(settings)

    response = service.run(
        FactCheckRequest(
            input_text=(
                "Riverdale University said its 2024 solar expansion reduced grid electricity "
                "purchases by 18 percent. Administrators also said the project cost $4 million. "
                "The same announcement claimed the project received no state funding and made "
                "Riverdale the first carbon-neutral campus in Pennsylvania."
            ),
            dataset_name="benchmark",
            include_rewrite=True,
        )
    )

    labels = [claim.label for claim in response.claims]

    assert response.summary.total_claims == 4
    assert VerdictLabel.SUPPORTED in labels
    assert VerdictLabel.REFUTED in labels
    assert VerdictLabel.NOT_ENOUGH_INFO in labels
    assert any(
        output.name.endswith(".json")
        for output in (tmp_path / "eval" / "results").iterdir()
    )
