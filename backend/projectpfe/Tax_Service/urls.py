from django.urls import path
from .views import TaxSaveView

urlpatterns = [
    path('save/',TaxSaveView.as_view())
]
