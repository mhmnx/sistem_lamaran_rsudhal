import django_filters
from .models import Lamaran
from django.db.models import Q

class LamaranFilter(django_filters.FilterSet):
    # Filter untuk alamat yang berada di model PelamarProfile
    provinsi = django_filters.CharFilter(field_name='pelamar__profile__provinsi', lookup_expr='icontains')
    kabupaten = django_filters.CharFilter(field_name='pelamar__profile__kabupaten', lookup_expr='icontains')
    kecamatan = django_filters.CharFilter(field_name='pelamar__profile__kecamatan', lookup_expr='icontains')
    LOKASI_CHOICES = (
        ('dalam_kota', 'Dalam Kota'),
        ('luar_kota', 'Luar Kota'),
    )
    lokasi = django_filters.ChoiceFilter(choices=LOKASI_CHOICES, method='filter_by_lokasi')

    class Meta:
        model = Lamaran
        # Tambahkan 'lokasi' ke dalam daftar fields
        fields = ['formasi', 'status', 'provinsi', 'kabupaten', 'kecamatan', 'lokasi']

    def filter_by_lokasi(self, queryset, name, value):
        # Logika kustom untuk filter lokasi
        if value == 'dalam_kota':
            # Jika 'Dalam Kota', cari yang kabupatennya Banjarnegara (tidak case-sensitive)
            return queryset.filter(pelamar__profile__kabupaten__iexact='Banjarnegara')
        elif value == 'luar_kota':
            # Jika 'Luar Kota', tampilkan selain Banjarnegara
            # Q(~...) berarti 'NOT' atau 'exclude'
            return queryset.exclude(pelamar__profile__kabupaten__iexact='Banjarnegara')
        return queryset
