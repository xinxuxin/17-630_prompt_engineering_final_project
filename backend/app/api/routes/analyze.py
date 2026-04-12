from fastapi import APIRouter

from app.api.routes.shared import get_fact_check_service
from app.schemas.pipeline import AnalyzeRequest, AnalyzeResponse

router = APIRouter()


@router.post("", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    service = get_fact_check_service()
    return service.analyze(payload)
