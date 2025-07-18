# Generated by Django 5.2.4 on 2025-07-09 09:17

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('lamaran', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='lamaran',
            name='pelamar',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lamaran', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='dokumenpelamar',
            name='lamaran',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dokumen', to='lamaran.lamaran'),
        ),
        migrations.AddField(
            model_name='pelamarprofile',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='lamaran',
            unique_together={('pelamar', 'formasi')},
        ),
    ]
