# backend/lamaran/urls.py
from django.urls import path
from .views import FormasiListView, FormasiDetailView, LamaranApplyView, VerifierLamaranListView, VerifierLamaranDetailView,LamaranUpdateStatusView, NilaiTesCreateView,VerifierDashboardStatsView
from .views import NilaiTesUpsertView, PublicDashboardStatsView, PelamarLamaranListView, DokumenLamaranUpdateView, ManualApplicantCreateView
from .views import ImportPelamarExcelView, PengaturanCetakView, InformasiListView
from .views import NilaiTesBulkUpdateView, LamaranBulkUpdateView, PublicPengumumanListView

urlpatterns = [
    path('formasi/', FormasiListView.as_view(), name='formasi-list'),
    path('public/dashboard-stats/', PublicDashboardStatsView.as_view(), name='public-dashboard-stats'), # <-- Tambahkan ini
    path('public/pengumuman/', PublicPengumumanListView.as_view(), name='public-pengumuman-list'),
    path('formasi/<int:pk>/', FormasiDetailView.as_view(), name='formasi-detail'),
    path('lamaran/apply/', LamaranApplyView.as_view(), name='lamaran-apply'),
    path('v1/lamaran/', VerifierLamaranListView.as_view(), name='verifier-lamaran-list'),
    path('v1/lamaran/<int:pk>/', VerifierLamaranDetailView.as_view(), name='verifier-lamaran-detail'),
    path('v1/lamaran/<int:pk>/update-status/', LamaranUpdateStatusView.as_view(), name='lamaran-update-status'),
    path('v1/dashboard-stats/', VerifierDashboardStatsView.as_view(), name='verifier-dashboard-stats'),
    path('v1/lamaran/<int:lamaran_pk>/nilai/upsert/', NilaiTesUpsertView.as_view(), name='nilai-tes-upsert'),
    path('pelamar/lamaran/', PelamarLamaranListView.as_view(), name='pelamar-lamaran-list'),
    path('v1/dokumen/<int:pk>/update-checklist/', DokumenLamaranUpdateView.as_view(), name='dokumen-update-checklist'),
    path('v1/pelamar/import-excel/', ImportPelamarExcelView.as_view(), name='pelamar-import-excel'),
    path('v1/pelamar/manual-create/', ManualApplicantCreateView.as_view(), name='pelamar-manual-create'),
    path('v1/pengaturan-cetak/', PengaturanCetakView.as_view(), name='pengaturan-cetak'),
    path('v1/informasi/', InformasiListView.as_view(), name='informasi-list'),
    path('v1/lamaran/bulk-update-nilai/', NilaiTesBulkUpdateView.as_view(), name='nilai-tes-bulk-update'),
    path('v1/lamaran/bulk-update/', LamaranBulkUpdateView.as_view(), name='lamaran-bulk-update'),




]