# backend/lamaran/admin.py
from django.contrib import admin
from .models import Formasi, PelamarProfile, Lamaran, DokumenLamaran, Disposisi
from .models import NilaiTes, PengaturanCetak, Informasi
# ...
admin.site.register(NilaiTes) # <-- Tambahkan ini
admin.site.register(Informasi)
admin.site.register(PengaturanCetak)
admin.site.register(Formasi)
admin.site.register(PelamarProfile)
admin.site.register(Lamaran)
admin.site.register(DokumenLamaran)
admin.site.register(Disposisi)