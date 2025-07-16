// frontend/src/pages/VerifierPage.tsx

import { useState, useEffect } from 'react';
import axios from 'axios';

// Pastikan instance axios ini dibuat
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

// PASTIKAN ADA "export default" DI SINI
export default function VerifierPage() {
  const [lamaranList, setLamaranList] = useState<any[]>([]);

  useEffect(() => {
    const fetchLamaran = async () => {
      try {
        const response = await api.get('/v1/lamaran/');
        setLamaranList(response.data);
      } catch (error) {
        console.error("Gagal mengambil data lamaran:", error);
      }
    };
    fetchLamaran();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Data Pelamar Masuk</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Nama Pelamar</th>
              <th className="py-2 px-4 border-b text-left">Formasi</th>
              <th className="py-2 px-4 border-b text-left">Tanggal Lamar</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {lamaranList.map(lamaran => (
              <tr key={lamaran.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{lamaran.pelamar.first_name || 'Nama Tidak Tersedia'}</td>
                <td className="py-2 px-4 border-b">{lamaran.formasi.nama_formasi}</td>
                <td className="py-2 px-4 border-b">{new Date(lamaran.tanggal_lamar).toLocaleDateString('id-ID')}</td>
                <td className="py-2 px-4 border-b">{lamaran.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}