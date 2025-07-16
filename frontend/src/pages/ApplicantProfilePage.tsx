import ProfileForm from '@/components/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';

export default function ApplicantProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground mt-2">
          {/* Tampilkan pesan berbeda jika profil belum lengkap */}
          {user && !user.is_profile_complete 
            ? "Harap lengkapi profil Anda untuk dapat melanjutkan ke tahap berikutnya."
            : "Perbarui informasi data diri Anda di bawah ini."
          }
        </p>
      </div>

      {/* Komponen form profil dirender di sini */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <ProfileForm />
      </div>
    </div>
  );
}