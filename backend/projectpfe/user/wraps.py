from functools import wraps
from django.http import JsonResponse , HttpRequest
from .auth import decode_jwt
from .models import Client

from projectpfe.utils.response import error_response  # adjust import if needed


def jwt_must(func):
    @wraps(func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        
        auth = request.headers.get("Auth")
        
        if not auth or not auth.startswith("Bearer "):
            return error_response("Unauthorized", status_code=401)
        
        token = auth.split(" ")[1]

        try:
            data = decode_jwt(token)
        except Exception as e:
            return error_response("invalid token", errors=str(e), status_code=401)

        if not data or data == "expired" or data.get("type") != "access":
            return error_response("invalid token", status_code=401)

        client = Client.objects.filter(id=data.get("user_id"))
        if not client.exists():
            return error_response("invalid user", status_code=401)

        request.user_id = data["user_id"] # type: ignore
        request.role = data.get("role") # type: ignore

        return func(request, *args, **kwargs)

    return wrapper
        


def role_required(roles):
    def dec(func):
        @wraps(func)
        def wrapper(request : HttpRequest, *args, **kwargs):
   
            if request.role not in roles: # type: ignore
                return error_response("you do not have permission", status_code=401)
            return func(request , *args, **kwargs)
        return wrapper
    return dec
        


def class_jwt_must(func):
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        auth = request.headers.get("Auth")
        if not auth or not auth.startswith("Bearer "):
            return error_response("Unauthorized", status_code=401)

        token = auth.split(" ")[1]
        try:
            data = decode_jwt(token)
        except Exception as e:
            return error_response("invalid token", errors=str(e), status_code=401)

        if not data or data == "expired" or data.get("type") != "access":
            return error_response("invalid token", status_code=401)

        if not Client.objects.filter(id=data.get("user_id")).exists():
            return error_response("invalid user", status_code=401)

        request.user_id = data["user_id"]  # type: ignore
        request.role = data.get("role")    # type: ignore

        return func(self, request, *args, **kwargs)
    return wrapper


def class_role_required(roles):
    def dec(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            if request.role not in roles:  # type: ignore
                return error_response("you do not have permission", status_code=401)
            return func(self, request, *args, **kwargs)
        return wrapper
    return dec

