# backend/users/urls.py
from django.urls import path
from .views import GoogleLogin, UserProfileView

urlpatterns = [
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('me/', UserProfileView.as_view(), name='user-profile'), # <-- Tambahkan ini
]