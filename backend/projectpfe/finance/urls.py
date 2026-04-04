
from django.contrib import admin
from django.urls import path
from .views import getbalance, payments , validatePayment
urlpatterns = [
    path('balance/',getbalance),
    path('payments/', payments),
    path('validatePayment/', validatePayment),
]
