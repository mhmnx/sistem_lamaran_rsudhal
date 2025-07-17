# lamaran/management/commands/seed_data.py

import random
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
from lamaran.models import Formasi, Lamaran, PelamarProfile
from users.models import User
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Membuat data dummy untuk aplikasi lamaran'

    def add_arguments(self, parser):
        parser.add_argument('total', type=int, help='Jumlah data dummy yang ingin dibuat')

    @transaction.atomic
    def handle(self, *args, **kwargs):
        total = kwargs['total']
        fake = Faker('id_ID')

        self.stdout.write("Membuat data dummy...")

        formasi_list = list(Formasi.objects.all())
        if not formasi_list:
            self.stdout.write(self.style.ERROR('Tidak ada data Formasi. Harap buat beberapa formasi terlebih dahulu.'))
            return

        for i in range(total):
            profile = fake.profile()
            full_name = profile['name']
            first_name = full_name.split(' ')[0]
            # Buat email yang lebih unik untuk menghindari konflik
            email = f"{slugify(full_name)}.{fake.unique.random_int(min=100, max=999)}@example.com"
            
            if User.objects.filter(email=email).exists():
                continue

            user = User.objects.create_user(
                username=email,
                email=email,
                first_name=first_name,
                password='password123'
            )

            PelamarProfile.objects.create(
                user=user,
                nama_lengkap=full_name,
                # PERBAIKAN DI SINI
                nik=fake.bothify(text='33##############'),
                tempat_lahir=fake.city(),
                tanggal_lahir=fake.date_of_birth(minimum_age=22, maximum_age=40),
                jenis_kelamin=profile.get('sex', 'L'),
                no_telepon=fake.phone_number(),
                pendidikan_terakhir=f"S1 {fake.job()}",
                provinsi=fake.lexify(text='Provinsi ????????'),
                kabupaten=fake.city(),
                kecamatan=fake.lexify(text='Kecamatan ????????'),
                desa=fake.lexify(text='Desa ????????'),
                alamat_lengkap=fake.address()
            )

            random_formasi = random.choice(formasi_list)
            
            if not Lamaran.objects.filter(pelamar=user, formasi=random_formasi).exists():
                Lamaran.objects.create(
                    pelamar=user,
                    formasi=random_formasi,
                    status='diajukan'
                )

            if (i + 1) % 10 == 0:
                self.stdout.write(f'Berhasil membuat user {i + 1}/{total}...')

        self.stdout.write(self.style.SUCCESS(f'Selesai! Berhasil membuat {total} data dummy baru.'))