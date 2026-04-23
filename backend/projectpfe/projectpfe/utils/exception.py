from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .response import error_response
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "success": False,
            "message": "Request error",
            "errors": response.data
        }
        return response

    
    

    return Response({
        "success": False,
        "message": "server error unknown",
        "errors": str(exc)
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)