from fastapi import APIRouter

from app.api.routes.shared import get_fact_check_service
from app.schemas.pipeline import FactCheckRequest, FactCheckResponse

router = APIRouter()


@router.post("", response_model=FactCheckResponse)
def fact_check(payload: FactCheckRequest) -> FactCheckResponse:
    service = get_fact_check_service()
    return service.run(payload)
