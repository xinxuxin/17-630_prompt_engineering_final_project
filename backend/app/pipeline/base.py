import json
import logging
from collections.abc import Callable
from time import perf_counter
from typing import TypeVar

from pydantic import BaseModel, ValidationError

from app.schemas.common import StageStatus, StageTrace
from app.providers.base import StructuredProvider

T = TypeVar("T")
M = TypeVar("M", bound=BaseModel)


def run_stage(
    stage_name: str,
    max_retries: int,
    primary: Callable[[], T],
    fallback: Callable[[], T],
    *,
    claim_id: str | None = None,
) -> tuple[T, StageTrace]:
    start = perf_counter()
    errors: list[str] = []
    logger = logging.getLogger(f"app.pipeline.{stage_name}")
    logger.info("stage_start", extra={"stage": stage_name, "claim_id": claim_id})

    for attempt in range(max_retries + 1):
        try:
            result = primary()
            duration_ms = int((perf_counter() - start) * 1000)
            logger.info(
                "stage_success",
                extra={
                    "stage": stage_name,
                    "claim_id": claim_id,
                    "duration_ms": duration_ms,
                    "retries": attempt,
                },
            )
            return (
                result,
                StageTrace(
                    stage=stage_name,
                    status=StageStatus.SUCCESS,
                    detail="Completed with primary stage logic.",
                    duration_ms=duration_ms,
                    retries=attempt,
                    claim_id=claim_id,
                ),
            )
        except Exception as exc:  # noqa: BLE001
            errors.append(str(exc))
            logger.warning(
                "stage_retry",
                extra={
                    "stage": stage_name,
                    "claim_id": claim_id,
                    "attempt": attempt,
                    "error": str(exc),
                },
            )

    result = fallback()
    duration_ms = int((perf_counter() - start) * 1000)
    logger.info(
        "stage_fallback",
        extra={
            "stage": stage_name,
            "claim_id": claim_id,
            "duration_ms": duration_ms,
            "retries": max_retries,
        },
    )
    return (
        result,
        StageTrace(
            stage=stage_name,
            status=StageStatus.FALLBACK,
            detail=" | ".join(errors) if errors else "Fallback path executed.",
            duration_ms=duration_ms,
            retries=max_retries,
            claim_id=claim_id,
        ),
    )


def validate_structured_output(raw_output: object, response_model: type[M]) -> M:
    if isinstance(raw_output, response_model):
        return raw_output
    if isinstance(raw_output, BaseModel):
        return response_model.model_validate(raw_output.model_dump())
    if isinstance(raw_output, str):
        return response_model.model_validate(json.loads(raw_output))
    return response_model.model_validate(raw_output)


def invoke_structured_generation(
    *,
    provider: StructuredProvider,
    system_prompt: str,
    user_prompt: str,
    response_model: type[M],
    max_retries: int,
    stage_name: str,
    claim_id: str | None = None,
) -> M:
    logger = logging.getLogger(f"app.pipeline.{stage_name}")
    last_error: Exception | None = None

    for attempt in range(max_retries + 1):
        try:
            raw_output = provider.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=response_model,
                max_retries=1,
            )
            return validate_structured_output(raw_output, response_model)
        except (ValidationError, ValueError, TypeError, RuntimeError, json.JSONDecodeError) as exc:
            last_error = exc
            logger.warning(
                "structured_parse_retry",
                extra={
                    "stage": stage_name,
                    "claim_id": claim_id,
                    "attempt": attempt,
                    "error": str(exc),
                },
            )

    raise RuntimeError(
        f"Structured generation failed for {stage_name}: {last_error}"
    ) from last_error
