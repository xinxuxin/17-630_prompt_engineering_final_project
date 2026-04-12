from functools import lru_cache

from app.core.settings import get_settings
from app.services.examples import ExampleService
from app.services.fact_check import FactCheckService


@lru_cache(maxsize=1)
def get_fact_check_service() -> FactCheckService:
    return FactCheckService(get_settings())


@lru_cache(maxsize=1)
def get_examples_service() -> ExampleService:
    return ExampleService()
