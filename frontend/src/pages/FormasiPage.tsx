// frontend/src/pages/FormasiPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext'; // <-- Impor useAuth
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'; // <-- Impor AlertDialog


const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

interface Formasi {
  id: number;
  nama_formasi: string;
  deskripsi: string;
  kebutuhan: number;
}

export default function FormasiPage() {
  const [formasiList, setFormasiList] = useState<Formasi[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // <-- Ambil data user dari context
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormasi = async () => {
      try {
        const response = await api.get('/formasi/');
        setFormasiList(response.data);
      } catch (error) {
        console.error("Gagal mengambil data formasi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFormasi();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Formasi Tersedia</h1>
      
      {/* Tampilkan pesan peringatan jika sudah melamar */}
      {user?.has_active_application && (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Anda sudah mengajukan lamaran.</p>
          <p>Anda hanya dapat melamar untuk satu formasi. Silakan tunggu informasi selanjutnya.</p>
        </div>
      )}

      <div className="space-y-4">
        {formasiList.length > 0 ? (
          formasiList.map(formasi => (
            <div key={formasi.id} className="p-4 border rounded-lg shadow-sm bg-white">
              <h2 className="text-xl font-semibold text-indigo-600">{formasi.nama_formasi}</h2>
              <p className="text-gray-700 mt-2">{formasi.deskripsi}</p>
              <p className="text-sm text-gray-500 mt-2">Kebutuhan: {formasi.kebutuhan} orang</p>
              
              {/* Tombol Lamar sekarang dinonaktifkan jika 'has_active_application' bernilai true */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="mt-4" disabled={user?.has_active_application}>
                    Lamar Sekarang
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Lamaran</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda akan melamar untuk formasi "{formasi.nama_formasi}". Pastikan data profil dan dokumen Anda sudah benar. Lanjutkan?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => navigate(`/lamar/${formasi.id}`)}>
                      Lanjutkan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <p>Saat ini belum ada formasi yang dibuka.</p>
        )}
      </div>
    </div>
  );
}