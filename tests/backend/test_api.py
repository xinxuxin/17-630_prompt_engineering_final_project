from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


def test_healthcheck_route() -> None:
    client = TestClient(app)
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert "provider" in payload


def test_analyze_route_returns_pipeline_metadata() -> None:
    client = TestClient(app)
    response = client.post(
        "/api/v1/analyze",
        json={
            "input_text": (
                "Riverdale University said its 2024 solar expansion reduced grid electricity "
                "purchases by 18 percent. Administrators also said the project cost $4 million."
            ),
            "dataset_name": "benchmark",
            "include_rewrite": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "pipeline_metadata" in payload
    assert "claims" in payload
    assert payload["pipeline_metadata"]["provider_name"] in {"mock", "openai-compatible"}
