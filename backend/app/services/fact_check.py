from app.core.settings import Settings
from app.pipeline.orchestrator import FactCheckOrchestrator
from app.providers.factory import build_provider
from app.schemas.pipeline import FactCheckRequest, FactCheckResponse
from app.services.retrieval_service import RetrievalService


class FactCheckService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.provider = build_provider(settings)
        self.retrieval_service = RetrievalService(settings)
        self.orchestrator = FactCheckOrchestrator(
            settings=settings,
            provider=self.provider,
            retrieval_service=self.retrieval_service,
        )

    def run(self, request: FactCheckRequest) -> FactCheckResponse:
        return self.orchestrator.run(request)
