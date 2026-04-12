from collections.abc import Callable
from time import perf_counter
from typing import TypeVar

from app.schemas.common import StageStatus, StageTrace

T = TypeVar("T")


def run_stage(
    stage_name: str,
    max_retries: int,
    primary: Callable[[], T],
    fallback: Callable[[], T],
) -> tuple[T, StageTrace]:
    start = perf_counter()
    errors: list[str] = []

    for attempt in range(max_retries + 1):
        try:
            result = primary()
            duration_ms = int((perf_counter() - start) * 1000)
            return (
                result,
                StageTrace(
                    stage=stage_name,
                    status=StageStatus.SUCCESS,
                    detail="Completed with primary stage logic.",
                    duration_ms=duration_ms,
                    retries=attempt,
                ),
            )
        except Exception as exc:  # noqa: BLE001
            errors.append(str(exc))

    result = fallback()
    duration_ms = int((perf_counter() - start) * 1000)
    return (
        result,
        StageTrace(
            stage=stage_name,
            status=StageStatus.FALLBACK,
            detail=" | ".join(errors) if errors else "Fallback path executed.",
            duration_ms=duration_ms,
            retries=max_retries,
        ),
    )
