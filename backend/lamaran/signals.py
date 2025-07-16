from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Lamaran, Disposisi, DokumenLamaran
from django.db.models.signals import post_delete

@receiver(post_save, sender=Lamaran)
def buat_disposisi_otomatis(sender, instance, created, **kwargs):
    """
    Sinyal ini akan membuat disposisi otomatis saat
    sebuah objek Lamaran baru dibuat.
    """
    if created:
        Disposisi.objects.create(
            lamaran=instance,
            catatan="Lamaran diterima oleh sistem dan siap untuk diverifikasi.",
            dibuat_oleh=None,  # Dibuat oleh sistem
            jenis='otomatis'
        )

@receiver(post_delete, sender=DokumenLamaran)
def hapus_file_dokumen_saat_dihapus(sender, instance, **kwargs):
    """
    Sinyal ini akan menghapus semua file fisik dari storage
    saat objek DokumenLamaran dihapus.
    """
    # Gunakan try-except untuk menghindari error jika file tidak ada
    try:
        instance.surat_lamaran.delete(save=False)
        instance.cv.delete(save=False)
        instance.ijazah.delete(save=False)
        instance.transkrip_nilai.delete(save=False)
        instance.ktp.delete(save=False)
        if instance.str:
            instance.str.delete(save=False)
    except Exception as e:
        print(f"Error saat menghapus file: {e}")