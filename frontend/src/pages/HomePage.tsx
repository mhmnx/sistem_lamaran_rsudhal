import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Hospital, LogIn } from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const internalRoles = ['verifikator', 'superadmin', 'penilai_wawancara', 'penilai_keterampilan'];
      if (internalRoles.includes(user.role)) {
        navigate('/verifier/dashboard');
      } else {
        navigate('/pelamar/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-white to-sky-100 px-6 py-12">
      <div className="max-w-3xl text-center">
        <div className="flex justify-center items-center gap-3 mb-6 text-sky-700">
          <Hospital className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Sistem Rekrutmen Pegawai RSUD Hj. Anna Lasmanah</h1>
        </div>
        <p className="text-gray-700 text-lg mb-6">
          Selamat datang di portal rekrutmen resmi RSUD Hj. Anna Lasmanah Banjarnegara. 
          Silakan masuk untuk mengajukan lamaran, mengunggah dokumen, dan mengikuti proses seleksi secara daring.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate("/login")}>
            <LogIn className="mr-2 h-4 w-4" />
            Masuk ke Sistem
          </Button>
          <Button variant="outline" onClick={() => window.open("https://rsud.banjarnegarakab.go.id", "_blank")}>
            Kunjungi Situs RSUD
          </Button>
        </div>
      </div>
    </div>
  );
}