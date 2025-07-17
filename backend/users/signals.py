from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from lamaran.models import PelamarProfile
from lamaran.models import PelamarProfile # <-- Impor PelamarProfile
from django.db.models.signals import post_save, post_delete

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Otomatis membuat PelamarProfile saat User baru dibuat
    DENGAN PERAN 'pelamar'.
    """
    # TAMBAHKAN KONDISI INI
    if created and instance.role == 'pelamar':
        PelamarProfile.objects.create(user=instance)

@receiver(post_delete, sender=PelamarProfile)
def hapus_file_pas_foto(sender, instance, **kwargs):
    """
    Sinyal ini akan menghapus file pas_foto secara fisik dari storage
    saat objek PelamarProfile dihapus dari database.
    """
    # Pastikan instance memiliki pas_foto sebelum mencoba menghapusnya
    if instance.pas_foto:
        instance.pas_foto.delete(save=False)