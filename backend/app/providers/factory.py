from app.core.settings import Settings
from app.providers.base import StructuredProvider
from app.providers.mock import MockLLMProvider
from app.providers.openai import OpenAIProvider


def build_provider(settings: Settings) -> StructuredProvider:
    if settings.provider.lower() == "openai":
        return OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
        )
    return MockLLMProvider()
