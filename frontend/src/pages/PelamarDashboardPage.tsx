// frontend/src/pages/PelamarDashboardPage.tsx
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/ProfileForm';

export default function PelamarDashboardPage() {
  const { user } = useAuth();

  return (
    // Kita hapus div header yang lama karena sudah ada di layout
    <div className="px-4 py-6 sm:px-0">
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Profil Anda</h2>
        <p className="text-gray-600">
          Selamat Datang, {user?.nama_lengkap || user?.email}! Lengkapi data diri Anda di bawah ini.
        </p>
        <ProfileForm />
      </div>
    </div>
  );
}