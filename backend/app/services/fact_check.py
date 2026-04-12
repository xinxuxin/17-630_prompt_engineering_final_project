from app.core.settings import Settings
from app.pipeline.orchestrator import PipelineOrchestrator
from app.providers.factory import build_provider
from app.schemas.pipeline import AnalyzeRequest, AnalyzeResponse


class FactCheckService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.provider = build_provider(settings)
        self.orchestrator = PipelineOrchestrator(settings=settings, provider=self.provider)

    def analyze(self, request: AnalyzeRequest) -> AnalyzeResponse:
        return self.orchestrator.run(request)

    def run(self, request: AnalyzeRequest) -> AnalyzeResponse:
        return self.analyze(request)
