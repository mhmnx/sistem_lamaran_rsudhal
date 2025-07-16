# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('pelamar', 'Pelamar'),
        ('verifikator', 'Verifikator'),
        ('superadmin', 'Superadmin'),
        # Tambahkan dua peran baru
        ('penilai_wawancara', 'Penilai Wawancara'),
        ('penilai_keterampilan', 'Penilai Keterampilan'),
    )
    # Gunakan email sebagai field login utama
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='pelamar')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # 'username' masih ada tapi tidak wajib untuk login

    def __str__(self):
        return self.email