// frontend/src/pages/ApplyPage.tsx
import { useState } from 'react';
import type { FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

// Definisikan tipe untuk state file
interface FilesState {
  surat_lamaran?: File;
  cv?: File;
  ijazah?: File;
  transkrip_nilai?: File;
  ktp?: File;
  str?: File;
}

export default function ApplyPage() {
  const { formasiId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FilesState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk menangani perubahan pada input file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: inputFiles[0] }));
    }
  };

  // Fungsi untuk handle submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // FormData adalah cara standar untuk mengirim file melalui HTTP
    const formData = new FormData();
    formData.append('formasi_id', formasiId || '');

    // Tambahkan setiap file ke dalam FormData
    for (const key in files) {
      const fileKey = key as keyof FilesState;
      if (files[fileKey]) {
        formData.append(fileKey, files[fileKey] as File);
      }
    }
    
    try {
      await api.post('/lamaran/apply/', formData, {
        headers: {
          // Header ini penting untuk upload file
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Lamaran berhasil diajukan!');
      // Arahkan pengguna kembali ke halaman formasi setelah berhasil
      navigate('/formasi');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(`Gagal mengajukan lamaran: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Terjadi kesalahan saat mengajukan lamaran.');
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Formulir Lamaran (Formasi ID: {formasiId})</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="font-semibold">Silakan upload dokumen yang diperlukan (format .pdf):</p>
        
        {/* Input file dengan onChange handler */}
        <div>
          <label className="block text-sm font-medium">Surat Lamaran*</label>
          <input type="file" name="surat_lamaran" onChange={handleFileChange} className="mt-1 block w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Daftar Riwayat Hidup (CV)*</label>
          <input type="file" name="cv" onChange={handleFileChange} className="mt-1 block w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Ijazah*</label>
          <input type="file" name="ijazah" onChange={handleFileChange} className="mt-1 block w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Transkrip Nilai*</label>
          <input type="file" name="transkrip_nilai" onChange={handleFileChange} className="mt-1 block w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium">KTP*</label>
          <input type="file" name="ktp" onChange={handleFileChange} className="mt-1 block w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium">STR (Opsional)</label>
          <input type="file" name="str" onChange={handleFileChange} className="mt-1 block w-full" />
        </div>
        
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {isSubmitting ? 'Mengirim...' : 'Kirim Lamaran'}
        </button>
      </form>
    </div>
  );
}