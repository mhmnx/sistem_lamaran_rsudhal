// frontend/src/components/ProfileForm.tsx

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom'; // <-- 1. Impor useNavigate
import { useToast } from '@/hooks/use-toast'; // <-- 2. Impor useToast

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

export default function ProfileForm() {
  const { user, checkAuthStatus } = useAuth();
  const navigate = useNavigate(); // <-- 3. Inisialisasi hook navigasi
  const { toast } = useToast(); // <-- 4. Inisialisasi hook toast
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nik: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    no_telepon: '',
    pendidikan_terakhir: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: '',
    desa: '',
    alamat_lengkap: '',
  });
  const [pasFotoFile, setPasFotoFile] = useState<File | null>(null); // State khusus untuk file foto

  useEffect(() => {
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || '',
        nik: user.nik || '',
        tempat_lahir: user.tempat_lahir || '',
        tanggal_lahir: user.tanggal_lahir || '',
        jenis_kelamin: user.jenis_kelamin || 'L',
        no_telepon: user.no_telepon || '',
        pendidikan_terakhir: user.pendidikan_terakhir || '',
        provinsi: user.provinsi || '',
        kabupaten: user.kabupaten || '',
        kecamatan: user.kecamatan || '',
        desa: user.desa || '',
        alamat_lengkap: user.alamat_lengkap || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPasFotoFile(e.target.files[0]);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Gunakan FormData karena kita mengirim file
    const dataToSend = new FormData();

    // Tambahkan semua data teks ke FormData
    for (const key in formData) {
      if (key !== 'pas_foto_url' && formData[key] !== null) {
        dataToSend.append(key, formData[key]);
      }
    }
    
    // Tambahkan file foto jika ada yang dipilih
    if (pasFotoFile) {
      dataToSend.append('pas_foto', pasFotoFile);
    }

    try {
      // Kirim sebagai multipart/form-data
      await api.put('/me/', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast({ title: "Sukses!", description: "Profil Anda telah berhasil diperbarui." });
      checkAuthStatus(); // Refresh data user, termasuk URL foto baru // Perbarui status auth
      
      // 6. Arahkan ke dashboard pelamar
      navigate('/pelamar/dashboard');

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          variant: "destructive",
          title: "Gagal Memperbarui Profil",
          description: JSON.stringify(error.response.data),
        });
        console.error('Data error:', error.response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Terjadi Kesalahan",
          description: "Gagal memperbarui profil.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bagian Pas Foto */}
      <div className="font-bold border-b pb-2">Pas Foto</div>
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.pas_foto_url} alt="Pas Foto" />
          <AvatarFallback>{user?.nama_lengkap?.charAt(0) || 'P'}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label htmlFor="pas_foto">Unggah Foto Baru (4x6)</Label>
          <Input id="pas_foto" name="pas_foto" type="file" accept="image/*" onChange={handleFileChange} />
          <p className="text-xs text-muted-foreground">Ukuran file maksimal 2MB.</p>
        </div>
      </div>
      {/* --- Data Diri --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
          <Input id="nama_lengkap" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nik">NIK</Label>
          <Input id="nik" name="nik" value={formData.nik} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
          <Input id="tempat_lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
          <Input id="tanggal_lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
          <Select name="jenis_kelamin" value={formData.jenis_kelamin} onValueChange={(value) => handleSelectChange('jenis_kelamin', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="no_telepon">No. Telepon</Label>
          <Input id="no_telepon" name="no_telepon" value={formData.no_telepon} onChange={handleChange} />
        </div>
      </div>

      {/* --- Pendidikan --- */}
      <div className="space-y-2">
          <Label htmlFor="pendidikan_terakhir">Pendidikan Terakhir</Label>
          <Input id="pendidikan_terakhir" name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} placeholder="Contoh: S1 Keperawatan" />
      </div>

      {/* --- Alamat --- */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="provinsi">Provinsi</Label>
          <Input id="provinsi" name="provinsi" value={formData.provinsi} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kabupaten">Kabupaten/Kota</Label>
          <Input id="kabupaten" name="kabupaten" value={formData.kabupaten} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kecamatan">Kecamatan</Label>
          <Input id="kecamatan" name="kecamatan" value={formData.kecamatan} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desa">Desa/Kelurahan</Label>
          <Input id="desa" name="desa" value={formData.desa} onChange={handleChange} />
        </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="alamat_lengkap">Alamat Lengkap</Label>
          <Textarea id="alamat_lengkap" name="alamat_lengkap" value={formData.alamat_lengkap} onChange={handleChange} placeholder="Nama jalan, nomor rumah, RT/RW..." />
      </div>

      <Button type="submit">Simpan Perubahan</Button>
    </form>
  );
}