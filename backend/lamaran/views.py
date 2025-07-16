from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Formasi, Lamaran, DokumenLamaran, Disposisi, NilaiTes, PengaturanCetak, Informasi
from .serializers import FormasiSerializer, DokumenLamaranCreateSerializer, LamaranDetailSerializer, LamaranExportSerializer, NilaiTesSerializer, FormasiStatSerializer, DokumenLamaranChecklistSerializer, PengaturanCetakSerializer
from .serializers import InformasiSerializer
from django_filters.rest_framework import DjangoFilterBackend # <-- Impor
from users.permissions import IsVerifierOrSuperadmin,CanViewInternalData, IsSuperadmin
from drf_excel.mixins import XLSXFileMixin # <-- Impor mixin
from drf_excel.renderers import XLSXRenderer # <-- Impor renderer (opsional jika sudah di settings)
from django.db.models import Count
from rest_framework.views import APIView # <-- Impor APIView
from .filters import LamaranFilter
import pandas as pd
from django.db import transaction
from users.models import User
from .models import PelamarProfile
from rest_framework.exceptions import ValidationError
import traceback
from django.utils import timezone
from datetime import datetime
from rest_framework.permissions import AllowAny
from django.db.models.functions import TruncMonth
import logging
import os
from .serializers import DokumenLamaranChecklistSerializer, PelamarProfileSerializer, PelamarProfile, PengumumanSerializer
from django.conf import settings

logger = logging.getLogger(__name__)

class FormasiListView(generics.ListAPIView):
    """
    Endpoint untuk menampilkan semua formasi yang aktif.
    Dapat diakses oleh siapa saja (publik).
    """
    queryset = Formasi.objects.filter(is_active=True)
    serializer_class = FormasiSerializer
    permission_classes = [permissions.AllowAny] # Siapapun boleh akses

class FormasiDetailView(generics.RetrieveAPIView):
    """
    Endpoint untuk menampilkan detail satu formasi.
    Dapat diakses oleh siapa saja (publik).
    """
    queryset = Formasi.objects.all()
    serializer_class = FormasiSerializer
    permission_classes = [permissions.AllowAny]
    
class LamaranApplyView(generics.CreateAPIView):
    """
    Endpoint untuk membuat lamaran baru beserta dokumennya.
    Menerima formasi_id dan file-file dokumen.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] # Untuk handle file upload
    serializer_class = DokumenLamaranCreateSerializer

    def create(self, request, *args, **kwargs):
        formasi_id = request.data.get('formasi_id')
        if not formasi_id:
            return Response(
                {"detail": "formasi_id tidak boleh kosong."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            formasi = Formasi.objects.get(pk=formasi_id)
        except Formasi.DoesNotExist:
            return Response(
                {"detail": "Formasi tidak ditemukan."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Cek apakah user sudah pernah melamar ke formasi yang sama
        if Lamaran.objects.filter(pelamar=request.user, formasi=formasi).exists():
            return Response(
                {"detail": "Anda sudah pernah melamar di formasi ini."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Buat objek Lamaran terlebih dahulu
        lamaran = Lamaran.objects.create(pelamar=request.user, formasi=formasi)

        # 2. Validasi dan simpan dokumen menggunakan serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Simpan dokumen dan hubungkan dengan lamaran yang baru dibuat
        serializer.save(lamaran=lamaran)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {"detail": "Lamaran berhasil diajukan."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class VerifierLamaranListView(XLSXFileMixin, generics.ListAPIView):
    queryset = Lamaran.objects.select_related(
        'pelamar', 'formasi', 'pelamar__profile'
    ).prefetch_related(
        'nilai_tes', 'disposisi'
    ).all().order_by('-tanggal_lamar')
    
    # PERBAIKAN DI SINI: Gunakan kelas izin yang benar
    permission_classes = [permissions.IsAuthenticated, CanViewInternalData]
    
    filter_backends = [DjangoFilterBackend]
    filterset_class = LamaranFilter
    filename = 'data-pelamar.xlsx'
    serializer_class = LamaranDetailSerializer

    def get_serializer_class(self):
        if self.request.query_params.get('format') == 'xlsx':
            return LamaranExportSerializer
        return super().get_serializer_class()
    
class VerifierLamaranDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lamaran.objects.all()
    serializer_class = LamaranDetailSerializer
    
    # PERBAIKAN: Gunakan izin CanViewInternalData
    permission_classes = [permissions.IsAuthenticated, CanViewInternalData]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        profile_data = request.data.pop('pelamar_profile', None)
        if profile_data:
            profile_serializer = PelamarProfileSerializer(instance.pelamar.profile, data=profile_data, partial=True)
            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()
        return super().update(request, *args, **kwargs)
    
class LamaranUpdateStatusView(generics.UpdateAPIView):
    queryset = Lamaran.objects.all()
    serializer_class = LamaranDetailSerializer
    # PERBAIKAN: Gunakan izin CanViewInternalData
    permission_classes = [permissions.IsAuthenticated, CanViewInternalData]
    

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')
        
        # Validasi apakah status yang dikirim valid
        valid_statuses = [choice[0] for choice in Lamaran.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"detail": "Status yang Anda kirim tidak valid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Simpan status lama untuk catatan
        old_status = instance.get_status_display()
        
        # Update status
        instance.status = new_status
        instance.save()
        
        # Buat catatan disposisi secara otomatis
        Disposisi.objects.create(
            lamaran=instance,
            catatan=f"Status diubah dari '{old_status}' menjadi '{instance.get_status_display()}' oleh verifikator.",
            dibuat_oleh=request.user,
            jenis='manual'
        )

        return Response(LamaranDetailSerializer(instance).data)

class VerifierLamaranListView(generics.ListAPIView):
    queryset = Lamaran.objects.select_related('pelamar', 'formasi', 'pelamar__profile').all().order_by('-tanggal_lamar')
    serializer_class = LamaranDetailSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewInternalData]
    filter_backends = [DjangoFilterBackend]
    filterset_class = LamaranFilter

    def get_serializer_class(self):
        # Gunakan serializer berbeda jika formatnya adalah xlsx
        if self.request.query_params.get('format') == 'xlsx':
            return LamaranExportSerializer
        return super().get_serializer_class()

class NilaiTesCreateView(generics.CreateAPIView):
    """
    Endpoint untuk Verifikator menambahkan nilai tes pada sebuah lamaran.
    """
    queryset = NilaiTes.objects.all()
    serializer_class = NilaiTesSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewInternalData]

    def perform_create(self, serializer):
        # Ambil lamaran dari URL dan set user saat ini sebagai pencatat
        lamaran = Lamaran.objects.get(pk=self.kwargs['lamaran_pk'])
        serializer.save(lamaran=lamaran, dicatat_oleh=self.request.user)
        

class VerifierDashboardStatsView(APIView):
    # PERBAIKAN: Gunakan izin CanViewInternalData
    permission_classes = [permissions.IsAuthenticated, AllowAny]

    def get(self, request, format=None):
        # Menghitung total pelamar
        total_pelamar = Lamaran.objects.count()
        formasi_queryset = Formasi.objects.filter(is_active=True)
        total_formasi_dibuka = formasi_queryset.count()
        stats_per_formasi = formasi_queryset.annotate(jumlah_pelamar=Count('pelamar_set'))
        formasi_data = FormasiStatSerializer(stats_per_formasi, many=True).data
        pelamar_dalam_kota = Lamaran.objects.filter(pelamar__profile__kabupaten__iexact='Banjarnegara').count()
        pelamar_luar_kota = Lamaran.objects.exclude(pelamar__profile__kabupaten__iexact='Banjarnegara').count()
        formasi_queryset = Formasi.objects.filter(is_active=True)
        total_formasi_dibuka = formasi_queryset.count()
        stats_per_formasi = formasi_queryset.annotate(jumlah_pelamar=Count('pelamar_set'))
        formasi_data = FormasiStatSerializer(stats_per_formasi, many=True).data

        # --- TAMBAHKAN LOGIKA UNTUK GRAFIK TREN BULANAN ---
        monthly_trend = Lamaran.objects \
            .annotate(bulan=TruncMonth('tanggal_lamar')) \
            .values('bulan') \
            .annotate(jumlah=Count('id')) \
            .order_by('bulan')
        
        # Format data agar mudah dibaca oleh library grafik di frontend
        tren_bulanan_data = [
            {
                "name": item['bulan'].strftime("%b"), # Contoh: "Jan", "Feb"
                "total": item['jumlah']
            } for item in monthly_trend
        ]
        # --- AKHIR PENAMBAHAN ---

        data = {
            'total_pelamar': total_pelamar,
            # Tambahkan data baru ke respons
            'pelamar_dalam_kota': pelamar_dalam_kota,
            'pelamar_luar_kota': pelamar_luar_kota,
            'total_formasi_dibuka': total_formasi_dibuka,
            'statistik_formasi': formasi_data,
            'tren_bulanan': tren_bulanan_data,
        }
        
        return Response(data)

class NilaiTesUpsertView(APIView):
    """
    Endpoint untuk membuat atau memperbarui nilai tes
    berdasarkan jenis tes untuk sebuah lamaran.
    """
    permission_classes = [permissions.IsAuthenticated, CanViewInternalData]

    def post(self, request, lamaran_pk):
        jenis_tes = request.data.get('jenis_tes')
        nilai = request.data.get('nilai')
        user_role = request.user.role

        # --- TAMBAHKAN BLOK VALIDASI PERAN ---
        if user_role == 'penilai_wawancara' and jenis_tes != 'wawancara':
            return Response({"error": "Anda hanya diizinkan menginput nilai wawancara."}, status=status.HTTP_403_FORBIDDEN)

        if user_role == 'penilai_keterampilan' and jenis_tes != 'keterampilan':
            return Response({"error": "Anda hanya diizinkan menginput nilai keterampilan."}, status=status.HTTP_403_FORBIDDEN)
        # --- AKHIR BLOK VALIDASI ---

        if not all([jenis_tes, nilai]):
            return Response(
                {"detail": "jenis_tes dan nilai tidak boleh kosong."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lamaran = Lamaran.objects.get(pk=lamaran_pk)
        except Lamaran.DoesNotExist:
            return Response(
                {"detail": "Lamaran tidak ditemukan."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Logika "update atau create"
        obj, created = NilaiTes.objects.update_or_create(
            lamaran=lamaran,
            jenis_tes=jenis_tes,
            defaults={'nilai': nilai, 'dicatat_oleh': request.user}
        )
        
        serializer = NilaiTesSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class PublicDashboardStatsView(APIView):
    """
    Endpoint publik untuk data statistik di dashboard pelamar.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        # --- TAMBAHKAN PERHITUNGAN BARU INI ---
        total_pelamar = Lamaran.objects.count()
        pelamar_dalam_kota = Lamaran.objects.filter(pelamar__profile__kabupaten__iexact='Banjarnegara').count()
        # Gunakan exclude untuk menghitung sisanya sebagai pelamar luar kota
        pelamar_luar_kota = Lamaran.objects.exclude(pelamar__profile__kabupaten__iexact='Banjarnegara').count()
        # --- AKHIR PENAMBAHAN ---

        formasi_queryset = Formasi.objects.filter(is_active=True)
        total_formasi_dibuka = formasi_queryset.count()
        
        stats_per_formasi = formasi_queryset.annotate(
            jumlah_pelamar=Count('pelamar_set')
        )
        formasi_data = FormasiStatSerializer(stats_per_formasi, many=True).data

        # Susun data untuk respon JSON
        data = {
            # Tambahkan data baru ke dalam respons
            'total_pelamar': total_pelamar,
            'pelamar_dalam_kota': pelamar_dalam_kota,
            'pelamar_luar_kota': pelamar_luar_kota,
            'total_formasi_dibuka': total_formasi_dibuka,
            'statistik_formasi': formasi_data,
        }
        return Response(data)


class PelamarLamaranListView(generics.ListAPIView):
    """
    Endpoint untuk pelamar melihat daftar lamaran miliknya sendiri.
    """
    serializer_class = LamaranDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Hanya kembalikan lamaran milik user yang sedang request
        return Lamaran.objects.filter(pelamar=self.request.user).order_by('-tanggal_lamar')

class DokumenLamaranUpdateView(generics.UpdateAPIView):
    queryset = DokumenLamaran.objects.all()
    serializer_class = DokumenLamaranChecklistSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewInternalData]
    
class ImportPelamarExcelView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsVerifierOrSuperadmin]
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        excel_file = request.FILES.get('file') # Ambil file
        if not excel_file:
            return Response({"error": "File Excel tidak ditemukan."}, status=400)

        try:
            # PERUBAHAN UTAMA: Gunakan pd.read_excel() bukan pd.read_csv()
            df = pd.read_excel(excel_file).fillna('')
            
            if df.empty:
                return Response({"error": "File Excel yang diunggah tidak berisi baris data."}, status=400)
            
            errors = []
            success_count = 0
            
            for index, row in df.iterrows():
                try:
                    # --- 1. Validasi Data Penting di Awal ---
                    nama = row.get('nama', '').strip()
                    email = row.get('email', '').strip()

                    if not nama:
                        errors.append(f"Baris {index + 2}: Kolom 'nama' wajib diisi.")
                        continue

                    # Cek Formasi hanya sekali
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={'username': email, 'first_name': nama.split(' ')[0]}
                    )
                    if created:
                        user.set_unusable_password()
                        user.save()

                    # --- 2. Konversi Tanggal dengan Aman ---
                    tanggal_lahir_obj = None
                    if row.get('tanggal_lahir'):
                        try:
                            tanggal_lahir_obj = datetime.strptime(row.get('tanggal_lahir'), '%d/%m/%Y').strftime('%Y-%m-%d')
                        except ValueError:
                            errors.append(f"Baris {index + 2}: Format tanggal_lahir salah.")
                            continue
                    
                    tanggal_lamar_obj = timezone.now()
                    if row.get('tanggal_disposisi'):
                        try:
                            tanggal_lamar_obj = datetime.strptime(row.get('tanggal_disposisi'), '%d/%m/%Y')
                        except ValueError:
                            errors.append(f"Baris {index + 2}: Format tanggal_disposisi salah.")
                            continue

                    # --- 3. Proses Pembuatan / Pembaruan Data ---
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={'username': email, 'first_name': row.get('nama', '').split(' ')[0]}
                    )
                    if created:
                        user.set_unusable_password()
                        user.save()

                    PelamarProfile.objects.update_or_create(
                        user=user,
                        defaults={
                            'nama_lengkap': row.get('nama', ''),
                            'nik': row.get('nik', ''),
                            'tempat_lahir': row.get('tempat_lahir', ''),
                            'tanggal_lahir': tanggal_lahir_obj,
                            'jenis_kelamin': row.get('jenis_kelamin', 'L'),
                            'alamat_lengkap': row.get('alamat', ''),
                            'pendidikan_terakhir': row.get('pendidikan', ''),
                            'no_telepon': row.get('no_telepon', ''),
                        }
                    )
                    
                    formasi_nama = row.get('formasi', '').strip()
                    if formasi_nama:
                        try:
                            formasi = Formasi.objects.get(nama_formasi__iexact=formasi_nama)
                            if not Lamaran.objects.filter(pelamar=user, formasi=formasi).exists():
                                Lamaran.objects.create(
                                    pelamar=user, 
                                    formasi=formasi,
                                    status='diajukan',
                                    tanggal_lamar=tanggal_lamar_obj # <-- Gunakan tanggal disposisi
                                )
                        except Formasi.DoesNotExist:
                            errors.append(f"Baris {index + 2}: Formasi '{formasi_nama}' diisi, namun tidak ditemukan di database.")

                    
                    success_count += 1
                
                except Exception as e:
                    errors.append(f"Baris {index + 2}: Terjadi error tak terduga - {str(e)}")

            if errors:
                return Response({
                    "status": f"{success_count} data berhasil diimpor.", 
                    "errors": errors
                }, status=207)
                
            return Response({"status": f"Semua {success_count} data berhasil diimpor."}, status=201)

        except Exception as e:
            return Response({"error": f"Gagal memproses file: {e}"}, status=400)

class ManualApplicantCreateView(APIView):
    """
    Endpoint untuk Verifikator/Superadmin menambah data pelamar baru secara manual,
    termasuk data profil, lamaran, dan upload dokumen.
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifierOrSuperadmin]
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data
        
        # 1. Validasi data awal yang lebih ketat
        formasi_id = data.get('formasi_id')
        email = data.get('email')
        nama_lengkap = data.get('nama_lengkap')
        nik = data.get('nik')

        if not all([email, nama_lengkap, nik, formasi_id]):
            return Response(
                {"error": "Email, Nama Lengkap, NIK, dan Formasi wajib diisi."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response({"error": f"Email '{email}' sudah terdaftar."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            formasi = Formasi.objects.get(pk=formasi_id)
        except (Formasi.DoesNotExist, ValueError): # <-- Tangkap juga ValueError jika pk bukan angka
            return Response({"error": "ID Formasi tidak valid atau tidak ditemukan."}, status=status.HTTP_404_NOT_FOUND)

        try:
            # 2. Buat User baru
            first_name = nama_lengkap.split(' ')[0]
            user = User.objects.create_user(
                username=email,
                email=email,
                first_name=first_name
            )
            user.set_unusable_password()
            user.save()

            tanggal_lahir_value = data.get('tanggal_lahir')
            if not tanggal_lahir_value: # Cek jika string kosong atau None
                tanggal_lahir_value = None
            
            # 3. Buat Profil Pelamar
            PelamarProfile.objects.update_or_create(
                user=user,
                defaults={
                    'nama_lengkap': data.get('nama_lengkap'),
                    'nik': data.get('nik'),
                    'tempat_lahir': data.get('tempat_lahir'),
                    'tanggal_lahir': tanggal_lahir_value,
                    'jenis_kelamin': data.get('jenis_kelamin'),
                    'no_telepon': data.get('no_telepon'),
                    'pendidikan_terakhir': data.get('pendidikan_terakhir'),
                    'provinsi': data.get('provinsi'),
                    'kabupaten': data.get('kabupaten'),
                    'kecamatan': data.get('kecamatan'),
                    'desa': data.get('desa'),
                    'alamat_lengkap': data.get('alamat_lengkap')
                }
            )
            # 4. Buat Lamaran
            lamaran = Lamaran.objects.create(
                pelamar=user,
                formasi=formasi
            )

            catatan_disposisi = data.get('catatan_disposisi')
            if catatan_disposisi:
                Disposisi.objects.create(
                    lamaran=lamaran,
                    catatan=catatan_disposisi,
                    dibuat_oleh=request.user,
                    jenis='manual'
                )
            # 5. Simpan Dokumen
            # Gunakan serializer yang sudah ada untuk validasi & simpan file

            dokumen_serializer = DokumenLamaranCreateSerializer(data=data)
            dokumen_serializer.is_valid(raise_exception=True)
            dokumen_serializer.save(lamaran=lamaran)
            
            return Response({"success": f"Pelamar {data['nama_lengkap']} berhasil dibuat."}, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            # Tangkap error validasi dari serializer secara eksplisit
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("❌ [ERROR] Exception occurred during pelamar creation:")
            traceback.print_exc()  # Print full traceback in console

            return Response({
                "error": "Terjadi kesalahan saat menambahkan pelamar.",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PengaturanCetakView(APIView):
    def get(self, request):
        setting = PengaturanCetak.objects.last()
        serializer = PengaturanCetakSerializer(setting)
        return Response(serializer.data)

class InformasiListView(generics.ListAPIView):
    queryset = Informasi.objects.order_by('-tanggal_terbit')
    serializer_class = InformasiSerializer
    permission_classes = [AllowAny]
    
class NilaiTesBulkUpdateView(APIView):
    """
    Endpoint untuk menerima banyak data nilai dan menyimpannya dalam satu transaksi.
    """
    permission_classes = [permissions.IsAuthenticated, CanViewInternalData]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # Ekspektasi data: [{"lamaran_id": 1, "jenis_tes": "tes_cat", "nilai": 85}, ...]
        updates = request.data
        if not isinstance(updates, list):
            return Response({"error": "Input harus berupa list."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            for item in updates:
                lamaran = get_object_or_404(Lamaran, pk=item.get('lamaran_id'))
                
                # Gunakan update_or_create untuk efisiensi
                NilaiTes.objects.update_or_create(
                    lamaran=lamaran,
                    jenis_tes=item.get('jenis_tes'),
                    defaults={
                        'nilai': item.get('nilai'),
                        'dicatat_oleh': request.user
                    }
                )
            return Response({"status": "Semua nilai berhasil disimpan."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Terjadi kesalahan: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
class LamaranBulkUpdateView(APIView):
    """
    Endpoint untuk menerima update massal pada beberapa field Lamaran.
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifierOrSuperadmin]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # Ekspektasi data: [{"id": 1, "status_kelulusan": "lulus", "keterangan": "Sangat baik"}, ...]
        updates = request.data
        if not isinstance(updates, list):
            return Response({"error": "Input harus berupa list."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            for item in updates:
                lamaran = get_object_or_404(Lamaran, pk=item.get('id'))
                if 'status_kelulusan' in item:
                    lamaran.status_kelulusan = item['status_kelulusan']
                if 'keterangan' in item:
                    lamaran.keterangan = item['keterangan']
                lamaran.save()
            
            return Response({"status": "Data lamaran berhasil diperbarui."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Terjadi kesalahan: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class PublicPengumumanListView(generics.ListAPIView):
    """
    Endpoint publik untuk menampilkan daftar pengumuman terbaru.
    """
    queryset = Informasi.objects.all().order_by('-tanggal_terbit')[:3] # Ambil 3 terbaru
    serializer_class = PengumumanSerializer
    permission_classes = [permissions.AllowAny]
