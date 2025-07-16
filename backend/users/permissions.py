# backend/users/permissions.py
from rest_framework import permissions

class IsVerifierOrSuperadmin(permissions.BasePermission):
    """
    Izin kustom untuk hanya mengizinkan Verifikator atau Superadmin.
    """
    def has_permission(self, request, view):
        # Cek apakah user terautentikasi dan memiliki peran yang sesuai
        return request.user and request.user.is_authenticated and (request.user.role in ['verifikator', 'superadmin'])

class CanViewInternalData(permissions.BasePermission):
    """
    Izin untuk peran internal (selain pelamar) yang boleh melihat data.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # --- BLOK DEBUGGING (bisa dimatikan di production) ---
        print("=======================================")
        print("CEK IZIN AKSES (CanViewInternalData)")
        print(f"User: {getattr(request.user, 'email', '-')}")
        print(f"Peran: {getattr(request.user, 'role', '-')}")
        
        allowed_roles = ['verifikator', 'superadmin', 'penilai_wawancara', 'penilai_keterampilan']
        print(f"Peran yang diizinkan: {allowed_roles}")
        
        is_allowed = request.user.role in allowed_roles
        print(f"Apakah peran diizinkan? -> {is_allowed}")
        print("=======================================")

        return is_allowed
    
class IsSuperadmin(permissions.BasePermission):
    """
    Izin kustom untuk hanya mengizinkan Superadmin.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser
    