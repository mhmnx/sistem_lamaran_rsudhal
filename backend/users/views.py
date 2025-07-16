# backend/users/views.py
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

# Pulihkan kode yang ini
from rest_framework import generics, permissions
from lamaran.models import PelamarProfile
from lamaran.serializers import PelamarProfileSerializer

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:3000'
    client_class = OAuth2Client

# Buat view untuk /api/me/
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PelamarProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = PelamarProfile.objects.get_or_create(user=self.request.user)
        return profile