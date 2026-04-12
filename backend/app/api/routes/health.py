from fastapi import APIRouter

from app.core.settings import get_settings
from app.providers.factory import build_provider

router = APIRouter()


@router.get("/health")
def healthcheck() -> dict[str, str | bool]:
    settings = get_settings()
    provider = build_provider(settings)
    return {
        "status": "ok",
        "environment": settings.app_env,
        "provider": provider.name,
        "provider_configured": provider.configured,
    }
