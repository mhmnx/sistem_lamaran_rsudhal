from django.apps import AppConfig


class LamaranConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lamaran'

    def ready(self):
        import lamaran.signals # Import file sinyal