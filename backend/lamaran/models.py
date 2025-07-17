# backend/lamaran/models.py
from django.db import models
from django.conf import settings # Cara terbaik untuk merujuk ke User model
from django.utils.text import slugify
import os
from django.utils import timezone

class Formasi(models.Model):
    nama_formasi = models.CharField(max_length=255)
    deskripsi = models.TextField()
    kebutuhan = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nama_formasi

class PelamarProfile(models.Model):
    JENIS_KELAMIN_CHOICES = (
        ('L', 'Laki-laki'),
        ('P', 'Perempuan'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')

    # Data Diri (dibuat tidak wajib diisi untuk awal)
    nama_lengkap = models.CharField(max_length=255, null=True, blank=True)
    # DIPERBAIKI
    nik = models.CharField(max_length=16, null=True, blank=True, help_text="Nomor Induk Kependudukan")
    tempat_lahir = models.CharField(max_length=100, null=True, blank=True)
    tanggal_lahir = models.DateField(null=True, blank=True)
    jenis_kelamin = models.CharField(max_length=1, choices=JENIS_KELAMIN_CHOICES, null=True, blank=True)
    no_telepon = models.CharField(max_length=20, null=True, blank=True)

    # Alamat (dibuat tidak wajib diisi untuk awal)
    provinsi = models.CharField(max_length=100, null=True, blank=True)
    kabupaten = models.CharField(max_length=100, null=True, blank=True)
    kecamatan = models.CharField(max_length=100, null=True, blank=True)
    desa = models.CharField(max_length=100, null=True, blank=True)
    alamat_lengkap = models.TextField(help_text="Nama jalan, nomor rumah, RT/RW", null=True, blank=True)

    # Pendidikan & Foto (dibuat tidak wajib diisi untuk awal)
    pendidikan_terakhir = models.CharField(max_length=100, help_text="Contoh: S1 Teknik Komputer", null=True, blank=True)
    pas_foto = models.ImageField(upload_to='pas_foto/', help_text="Digunakan sebagai foto profil", null=True, blank=True)

    def __str__(self):
        # Mengantisipasi jika nama lengkap belum diisi
        return self.nama_lengkap if self.nama_lengkap else self.user.email
    
class Lamaran(models.Model):
    STATUS_CHOICES = (
        ('diajukan', 'Diajukan'),
        ('lolos_verifikasi', 'Lolos Verifikasi Berkas'),
        ('gagal_verifikasi', 'Gagal Verifikasi Berkas'),
        ('tes_tulis', 'Tes Tulis'),
        ('wawancara', 'Wawancara'),
        ('diterima', 'Diterima'),
        ('ditolak', 'Ditolak'),
    )
    pelamar = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lamaran')
    formasi = models.ForeignKey(Formasi, on_delete=models.CASCADE, related_name='pelamar_set')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='diajukan')
    
    # PASTIKAN FIELD INI ADA DAN NAMANYA TEPAT
    tanggal_lamar = models.DateTimeField(default=timezone.now)

    STATUS_LULUS_CHOICES = (
        ('lulus', 'Lulus'),
        ('tidak_lulus', 'Tidak Lulus'),
    )
    status_kelulusan = models.CharField(max_length=20, choices=STATUS_LULUS_CHOICES, null=True, blank=True)
    keterangan = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ('pelamar', 'formasi')

    def __str__(self):
        return f"{self.pelamar.email} - {self.formasi.nama_formasi}"

def get_upload_path(instance, filename, document_type):
    """
    Membuat path upload dinamis dan nama file baru.
    Format: 'dokumen/<nama_formasi>/<nama_pelamar>/<tipe_dokumen>_<nama_pelamar>.ext'
    """
    lamaran = instance.lamaran
    formasi_name = slugify(lamaran.formasi.nama_formasi)
    pelamar_name = slugify(lamaran.pelamar.get_full_name() or lamaran.pelamar.email)
    extension = os.path.splitext(filename)[1]

    # Membuat nama file baru
    new_filename = f"{document_type}_{pelamar_name}{extension}"

    return os.path.join('dokumen', formasi_name, pelamar_name, new_filename)

# Buat fungsi parsial untuk setiap tipe dokumen
from functools import partial
get_surat_lamaran_path = partial(get_upload_path, document_type='surat_lamaran')
get_cv_path = partial(get_upload_path, document_type='cv')
get_ijazah_path = partial(get_upload_path, document_type='ijazah')
get_transkrip_path = partial(get_upload_path, document_type='transkrip_nilai')
get_ktp_path = partial(get_upload_path, document_type='ktp')
get_str_path = partial(get_upload_path, document_type='str')

class DokumenLamaran(models.Model):
    lamaran = models.OneToOneField(Lamaran, on_delete=models.CASCADE, related_name='dokumen')
    surat_lamaran = models.FileField(upload_to=get_surat_lamaran_path)
    cv = models.FileField(upload_to=get_cv_path, verbose_name="Daftar Riwayat Hidup")
    ijazah = models.FileField(upload_to=get_ijazah_path)
    transkrip_nilai = models.FileField(upload_to=get_transkrip_path)
    ktp = models.FileField(upload_to=get_ktp_path)
    str = models.FileField(upload_to=get_str_path, null=True, blank=True, help_text="Surat Tanda Registrasi (jika ada)")
    is_surat_lamaran_verified = models.BooleanField(default=False)
    is_cv_verified = models.BooleanField(default=False)
    is_ijazah_verified = models.BooleanField(default=False)
    is_transkrip_nilai_verified = models.BooleanField(default=False)
    is_ktp_verified = models.BooleanField(default=False)
    is_str_verified = models.BooleanField(default=False)
    is_pas_foto_verified = models.BooleanField(default=False)
     
    def __str__(self):
        return f"Dokumen untuk lamaran {self.lamaran}"
    
class Disposisi(models.Model):
    JENIS_CHOICES = (
        ('otomatis', 'Otomatis'),
        ('manual', 'Manual'),
    )
    lamaran = models.ForeignKey(Lamaran, on_delete=models.CASCADE, related_name='disposisi')
    catatan = models.TextField()
    dibuat_oleh = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    jenis = models.CharField(max_length=10, choices=JENIS_CHOICES)

    class Meta:
        ordering = ['-dibuat_pada'] # Urutkan dari yang terbaru

    def __str__(self):
        return f"Disposisi untuk {self.lamaran} oleh {self.dibuat_oleh}"

# backend/lamaran/models.py

class NilaiTes(models.Model):
    # Tambahkan pilihan untuk jenis tes
    JENIS_TES_CHOICES = (
        ('tes_cat', 'Tes CAT'),
        ('keterampilan', 'Keterampilan'),
        ('psikotest', 'Psikotest'),
        ('wawancara', 'Wawancara'),
    )

    lamaran = models.ForeignKey(Lamaran, on_delete=models.CASCADE, related_name='nilai_tes')
    # Ubah field ini untuk menggunakan choices
    jenis_tes = models.CharField(max_length=100, choices=JENIS_TES_CHOICES)
    nilai = models.FloatField()
    dicatat_oleh = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    dicatat_pada = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Gunakan get_jenis_tes_display() untuk menampilkan label yang mudah dibaca
        return f"Nilai {self.get_jenis_tes_display()} untuk {self.lamaran.pelamar.email}"

def get_upload_path(instance, filename, document_type):
    """
    Membuat path upload dinamis dan nama file baru.
    Format: 'dokumen/<nama_formasi>/<nama_pelamar>/<tipe_dokumen>_<nama_pelamar>.ext'
    """
    lamaran = instance.lamaran
    formasi_name = slugify(lamaran.formasi.nama_formasi)
    pelamar_name = slugify(lamaran.pelamar.get_full_name() or lamaran.pelamar.email)
    extension = os.path.splitext(filename)[1]

    # Membuat nama file baru
    new_filename = f"{document_type}_{pelamar_name}{extension}"

    return os.path.join('dokumen', formasi_name, pelamar_name, new_filename)

# Buat fungsi parsial untuk setiap tipe dokumen
from functools import partial
get_surat_lamaran_path = partial(get_upload_path, document_type='surat_lamaran')
get_cv_path = partial(get_upload_path, document_type='cv')
get_ijazah_path = partial(get_upload_path, document_type='ijazah')
get_transkrip_path = partial(get_upload_path, document_type='transkrip_nilai')
get_ktp_path = partial(get_upload_path, document_type='ktp')
get_str_path = partial(get_upload_path, document_type='str')

class PengaturanCetak(models.Model):
    tempat = models.CharField(max_length=100, default="Banjarnegara")
    jabatan = models.CharField(max_length=200, default="Direktur RSUD Hj. Anna Lasmanah")
    nama = models.CharField(max_length=100)
    nip = models.CharField(max_length=30)

    def __str__(self):
        return f"Pengaturan Cetak oleh {self.nama}"

class Informasi(models.Model):
    judul = models.CharField(max_length=255)
    tanggal_terbit = models.DateField(auto_now_add=True)
    isi = models.TextField()

    def __str__(self):
        return self.judul