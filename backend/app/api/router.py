from fastapi import APIRouter

from app.api.routes import analyze, examples, fact_check, health

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
api_router.include_router(fact_check.router, prefix="/fact-check", tags=["fact-check"])
api_router.include_router(examples.router, prefix="/examples", tags=["examples"])
