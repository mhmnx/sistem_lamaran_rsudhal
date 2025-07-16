import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function InternalStaffRoute() {
  const { isAuthenticated, user, loading } = useAuth(); // Asumsikan ada 'loading' dari context

  if (loading) {
    return <div>Loading...</div>; // Tampilkan loading jika status auth belum pasti
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Definisikan semua peran yang boleh masuk
  const internalRoles = ['verifikator', 'superadmin', 'penilai_wawancara', 'penilai_keterampilan'];

  // Jika peran user tidak termasuk dalam daftar, kembalikan ke halaman utama
  if (!user || !internalRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Jika lolos semua pengecekan, tampilkan halaman yang diminta
  return <Outlet />;
}