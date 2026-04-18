from django.urls import path
from .views import *

urlpatterns = [
    path('save/',TaxSaveView.as_view()),
    path('filter/<str:search_type>/',TaxListView.as_view()),
]
