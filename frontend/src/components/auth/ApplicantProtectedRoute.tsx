// frontend/src/components/auth/ApplicantProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ApplicantProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (user && !user.is_profile_complete && location.pathname !== '/pelamar/profil') {
    // Jika profil belum lengkap DAN user tidak sedang di halaman profil,
    // paksa redirect ke halaman profil.
    return <Navigate to="/pelamar/profil" replace />;
  }

  return <Outlet />;
}