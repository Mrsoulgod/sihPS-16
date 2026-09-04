import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional
from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class DomainException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[List[Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details or []


def build_error_response(
    status_code: int,
    code: str,
    message: str,
    details: Optional[List[Any]] = None,
    request_id: Optional[str] = None,
) -> JSONResponse:
    content = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
        },
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": request_id or f"req-{uuid.uuid4().hex[:8]}",
        },
    }
    return JSONResponse(status_code=status_code, content=content)


async def domain_exception_handler(request: Request, exc: DomainException) -> JSONResponse:
    return build_error_response(
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    code = "HTTP_ERROR"
    if exc.status_code == 404:
        code = "NOT_FOUND"
    elif exc.status_code == 401:
        code = "UNAUTHORIZED"
    elif exc.status_code == 403:
        code = "FORBIDDEN"
    elif exc.status_code == 400:
        code = "BAD_REQUEST"

    message = exc.detail if isinstance(exc.detail, str) else "An HTTP error occurred."
    details = exc.detail if isinstance(exc.detail, list) else []

    return build_error_response(
        status_code=exc.status_code,
        code=code,
        message=message,
        details=details if isinstance(details, list) else [details],
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    formatted_errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []))
        formatted_errors.append({"field": field, "issue": err.get("msg")})

    return build_error_response(
        status_code=422,
        code="VALIDATION_ERROR",
        message="Request validation failed.",
        details=formatted_errors,
    )
