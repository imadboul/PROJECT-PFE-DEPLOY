from django.urls import path
from .views import signup, login, verifyEmail, refresh_access, get_notifications, notificationread

urlpatterns = [
    path('signUp/', signup),
    path('verifyEmail/<str:token>/', verifyEmail),
    path('login/', login),
    path('notification/', get_notifications),
    path('notification/<int:id>', notificationread),
    path('refresh/', refresh_access),
]