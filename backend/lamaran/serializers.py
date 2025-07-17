# backend/lamaran/serializers.py
from rest_framework import serializers
from .models import Formasi, PelamarProfile, Lamaran, DokumenLamaran, Disposisi, NilaiTes, PengaturanCetak, Informasi
from users.models import User


# Serializer untuk menampilkan data user secara ringkas
class UserSimpleSerializer(serializers.ModelSerializer):
    # Ambil NIK dari profil yang berelasi
    nik = serializers.CharField(source='profile.nik', read_only=True, default=None)

    class Meta:
        model = User
        # Tambahkan 'nik' ke dalam fields
        fields = ['id', 'email', 'first_name', 'last_name', 'nik']

# Serializer untuk Formasi
class FormasiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formasi
        fields = ['id', 'nama_formasi', 'deskripsi', 'kebutuhan', 'is_active']

# Serializer untuk Dokumen Lamaran
class DokumenLamaranSerializer(serializers.ModelSerializer):
    class Meta:
        model = DokumenLamaran
        fields = '__all__'

# Serializer untuk Disposisi
class DisposisiSerializer(serializers.ModelSerializer):
    # Menampilkan data ringkas pembuat disposisi
    dibuat_oleh = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Disposisi
        fields = ['id', 'catatan', 'dibuat_oleh', 'dibuat_pada', 'jenis']

class NilaiTesSerializer(serializers.ModelSerializer):
    dicatat_oleh = UserSimpleSerializer(read_only=True)

    class Meta:
        model = NilaiTes
        fields = ['id', 'jenis_tes', 'nilai', 'dicatat_oleh', 'dicatat_pada']


# Serializer untuk membuat Lamaran baru (Create View)
class LamaranCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lamaran
        fields = ['formasi'] # Saat melamar, pelamar hanya perlu mengirim ID formasi
        
class DokumenLamaranCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DokumenLamaran
        # Semua field di model DokumenLamaran kecuali 'lamaran' karena akan di-handle oleh view
        fields = [
            'surat_lamaran', 
            'cv', 
            'ijazah', 
            'transkrip_nilai', 
            'ktp', 
            'str'
        ]

class PelamarProfileSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    is_profile_complete = serializers.SerializerMethodField()
    has_active_application = serializers.SerializerMethodField()
    pas_foto_url = serializers.SerializerMethodField()

    class Meta:
        model = PelamarProfile
        fields = [
            'id', 'user', 'role', 'is_profile_complete', 'has_active_application',
            'pas_foto_url', 'nama_lengkap', 'nik', 'tempat_lahir', 
            'tanggal_lahir', 'jenis_kelamin', 'no_telepon', 'provinsi', 
            'kabupaten', 'kecamatan', 'desa', 'alamat_lengkap', 
            'pendidikan_terakhir', 'pas_foto'
        ]
    
    def get_is_profile_complete(self, obj):
        required_fields = [obj.nik, obj.no_telepon, obj.alamat_lengkap]
        return all(field is not None and field != '' for field in required_fields)

    def get_has_active_application(self, obj):
        return Lamaran.objects.filter(pelamar=obj.user).exists()

    # PERBAIKAN UTAMA ADA DI SINI
    def get_pas_foto_url(self, obj):
        request = self.context.get('request')
        # Tambahkan pengecekan apakah request ada
        if request and obj.pas_foto and hasattr(obj.pas_foto, 'url'):
            return request.build_absolute_uri(obj.pas_foto.url)
        return None

# Serializer utama untuk Lamaran (Detail View)
class LamaranDetailSerializer(serializers.ModelSerializer):
    pelamar = UserSimpleSerializer(read_only=True)
    # TAMBAHKAN BARIS INI untuk mengambil semua data dari profil
    pelamar_profile = PelamarProfileSerializer(source='pelamar.profile', read_only=True)
    
    formasi = FormasiSerializer(read_only=True)
    dokumen = DokumenLamaranSerializer(read_only=True)
    disposisi = DisposisiSerializer(many=True, read_only=True)
    nilai_tes = NilaiTesSerializer(many=True, read_only=True)

    class Meta:
        model = Lamaran
        # Tambahkan 'pelamar_profile' ke dalam fields
        fields = [
            'id', 'pelamar', 'pelamar_profile', 'formasi', 'status', 'tanggal_lamar', 
            'dokumen', 'disposisi', 'nilai_tes', 
            'status_kelulusan', 'keterangan'
        ]


class LamaranExportSerializer(serializers.ModelSerializer):
    """
    Serializer untuk meratakan data lamaran agar rapi saat diekspor ke Excel.
    """
    nama_pelamar = serializers.CharField(source='pelamar.get_full_name', read_only=True)
    email_pelamar = serializers.CharField(source='pelamar.email', read_only=True)
    formasi_dilamar = serializers.CharField(source='formasi.nama_formasi', read_only=True)
    tanggal_lamar_formatted = serializers.DateTimeField(source='tanggal_lamar', read_only=True, format="%d-%m-%Y %H:%M")

    class Meta:
        model = Lamaran
        fields = [
            'id', 
            'nama_pelamar', 
            'email_pelamar', 
            'formasi_dilamar', 
            'status', 
            'tanggal_lamar_formatted'
        ]

class FormasiStatSerializer(serializers.ModelSerializer):
    """
    Serializer untuk menampilkan statistik per formasi di dashboard.
    """
    jumlah_pelamar = serializers.IntegerField(read_only=True)

    class Meta:
        model = Formasi
        fields = ['id', 'nama_formasi', 'kebutuhan', 'jumlah_pelamar']
        
class DokumenLamaranChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = DokumenLamaran
        # Hanya ekspos field verifikasi
        fields = [
            'is_surat_lamaran_verified', 'is_cv_verified', 'is_ijazah_verified',
            'is_transkrip_nilai_verified', 'is_ktp_verified', 'is_str_verified','is_pas_foto_verified'
        ]

class PengaturanCetakSerializer(serializers.ModelSerializer):
    class Meta:
        model = PengaturanCetak
        fields = '__all__'

class InformasiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Informasi
        fields = ['id', 'judul', 'tanggal_terbit', 'isi']
        
class LamaranExportSerializer(serializers.ModelSerializer):
    """
    Serializer yang disesuaikan agar output Excel-nya
    cocok dengan format template impor CSV.
    """
    # Ganti nama field agar sesuai dengan header CSV
    email = serializers.CharField(source='pelamar.email', read_only=True)
    nama = serializers.CharField(source='pelamar.profile.nama_lengkap', read_only=True)
    nik = serializers.CharField(source='pelamar.profile.nik', read_only=True)
    tempat_lahir = serializers.CharField(source='pelamar.profile.tempat_lahir', read_only=True)
    
    # Gunakan SerializerMethodField untuk memformat tanggal menjadi DD/MM/YYYY
    tanggal_lahir = serializers.SerializerMethodField()
    
    jenis_kelamin = serializers.CharField(source='pelamar.profile.jenis_kelamin', read_only=True)
    alamat = serializers.CharField(source='pelamar.profile.alamat_lengkap', read_only=True)
    pendidikan = serializers.CharField(source='pelamar.profile.pendidikan_terakhir', read_only=True)
    no_telepon = serializers.CharField(source='pelamar.profile.no_telepon', read_only=True)
    formasi = serializers.CharField(source='formasi.nama_formasi', read_only=True)

    # Gunakan tanggal lamar sebagai tanggal disposisi dengan format DD/MM/YYYY
    tanggal_disposisi = serializers.SerializerMethodField()

    class Meta:
        model = Lamaran
        # Susun field sesuai urutan template CSV
        fields = [
            'email',
            'nama',
            'nik',
            'tempat_lahir',
            'tanggal_lahir',
            'jenis_kelamin',
            'alamat',
            'pendidikan',
            'no_telepon',
            'formasi',
            'tanggal_disposisi',
        ]

    def get_tanggal_lahir(self, obj):
        if obj.pelamar.profile.tanggal_lahir:
            return obj.pelamar.profile.tanggal_lahir.strftime('%d/%m/%Y')
        return ""

    def get_tanggal_disposisi(self, obj):
        if obj.tanggal_lamar:
            return obj.tanggal_lamar.strftime('%d/%m/%Y')
        return ""

class PengumumanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Informasi
        fields = ['id', 'judul', 'tanggal_terbit', 'isi']
        
def get_pas_foto_url(self, obj):
        # Membuat URL lengkap untuk foto
        request = self.context.get('request')
        if obj.pas_foto and hasattr(obj.pas_foto, 'url'):
            return request.build_absolute_uri(obj.pas_foto.url)
        return None