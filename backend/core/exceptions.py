import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    # Panggil exception handler default dari DRF terlebih dahulu
    response = exception_handler(exc, context)
    
    # Ambil detail request dari context
    request = context.get('request')
    user = request.user.email if request.user.is_authenticated else 'Anonymous'
    path = request.path
    method = request.method

    if response is not None:
        # Untuk error yang ditangani DRF (4xx client errors)
        error_detail = str(response.data)
        log_message = (
            f"Handled Exception: {exc.__class__.__name__} at {path} ({method}). "
            f"Status: {response.status_code}. User: {user}. Detail: {error_detail}"
        )
        logger.warning(log_message)
    else:
        # Untuk error yang tidak ditangani / crash (5xx server errors)
        log_message = (
            f"Unhandled Exception: {exc.__class__.__name__} at {path} ({method}). "
            f"User: {user}."
        )
        # exc_info=True akan menyertakan traceback lengkap ke dalam log
        logger.error(log_message, exc_info=True)
        
        # Berikan respons error 500 yang generik
        response = Response(
            {"error": "Terjadi kesalahan internal pada server."},
            status=500
        )

    return response