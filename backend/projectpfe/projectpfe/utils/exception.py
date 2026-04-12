from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .response import error_response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

       
    if response is not None:
        return error_response(
            message="Request error",
            errors=response.data,
            status_code=response.status_code
        )

    
    return error_response(
        message=" server error unknown",
        errors=str(exc),
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )