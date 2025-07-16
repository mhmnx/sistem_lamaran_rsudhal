from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from lamaran.models import PelamarProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Otomatis membuat PelamarProfile saat User baru dibuat
    DENGAN PERAN 'pelamar'.
    """
    # TAMBAHKAN KONDISI INI
    if created and instance.role == 'pelamar':
        PelamarProfile.objects.create(user=instance)