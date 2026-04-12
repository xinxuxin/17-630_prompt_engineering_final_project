from fastapi import APIRouter

from app.api.routes.shared import get_examples_service

router = APIRouter()


@router.get("")
def list_examples() -> dict[str, object]:
    service = get_examples_service()
    return {"items": service.list_examples()}
