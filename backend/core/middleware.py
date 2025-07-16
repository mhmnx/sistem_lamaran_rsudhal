import logging
import time


logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        # Log sebelum view dieksekusi
        log_data = {
            'path': request.path,
            'method': request.method,
            'user': request.user.email if request.user.is_authenticated else 'Anonymous',
            'ip': request.META.get('REMOTE_ADDR'),
        }
        logger.info(f"Incoming request: {log_data}")
        
        response = self.get_response(request)
        
        # Log setelah view dieksekusi
        duration = time.time() - start_time
        logger.info(f"Response status: {response.status_code}, duration: {duration:.2f}s")
        
        return response