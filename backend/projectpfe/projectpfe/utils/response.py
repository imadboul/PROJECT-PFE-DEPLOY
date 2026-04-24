from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination


class MyPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 100


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    return Response({
        "states": "SUCCESS",
        "message": message,
        "data": data
    }, status=status_code)


def error_response(message="Error", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({
        "states": "ERROR",
        "message": message,
        "errors": errors
    }, status=status_code)

    
    
def paginated_response(paginator, serializer):
    return  {
        "results": serializer.data,
        "count": paginator.page.paginator.count,
        "total_pages": paginator.page.paginator.num_pages,
        "current_page": paginator.page.number,
        "page_size": paginator.page.paginator.per_page,
        "has_next": paginator.page.has_next(),
        "has_previous": paginator.page.has_previous(),
        "next": paginator.get_next_link(),
        "previous": paginator.get_previous_link(),
    }