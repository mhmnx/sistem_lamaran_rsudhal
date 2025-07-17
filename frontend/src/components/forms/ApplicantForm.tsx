// frontend/src/components/forms/ApplicantForm.tsx

import { useState, useEffect } from 'react';
import type { FormEvent} from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

interface ApplicantFormProps {
  onSuccess: () => void;
  initialData?: any | null;
}

const EMPTY_FORM_STATE = {
  email: '', nama_lengkap: '', nik: '', tempat_lahir: '',
  tanggal_lahir: '', jenis_kelamin: 'L', no_telepon: '',
  pendidikan_terakhir: '', provinsi: '', kabupaten: '',
  kecamatan: '', desa: '', alamat_lengkap: '', formasi: '',
  catatan_disposisi: '',
};

export default function ApplicantForm({ onSuccess, initialData }: ApplicantFormProps) {
  const [formasiList, setFormasiList] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(EMPTY_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    api.get('/formasi/').then(res => setFormasiList(res.data));
  }, []);

  useEffect(() => {
    if (isEditMode && initialData) {
      const profile = initialData.pelamar_profile || {};
      setFormData({
        ...profile,
        email: initialData.pelamar?.email || '',
        formasi: initialData.formasi?.id || '',
        tanggal_lamar: initialData.tanggal_lamar || '',
      });
    } else {
      setFormData(EMPTY_FORM_STATE);
    }
  }, [initialData, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // PERBAIKAN: Hanya ada satu fungsi handleSubmit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dataToSend = new FormData();

    try {
      if (isEditMode) {
        // ===============================================
        // PERBAIKAN LOGIKA UNTUK MODE EDIT
        // ===============================================
        const profileData: any = {};
        // Kumpulkan hanya data teks dari form
        Object.keys(formData).forEach(key => {
          // Jangan kirim field file atau field yang tidak relevan
          if (key !== 'pas_foto' && key !== 'pas_foto_url' && key !== 'user' && key !== 'id') {
            profileData[key] = formData[key];
          }
        });

        // Kirim data dalam format nested yang diharapkan backend
        // `pelamar_profile` hanya akan berisi data teks
        await api.patch(`/v1/lamaran/${initialData.id}/`, {
          pelamar_profile: profileData
        });

        toast({ title: "Sukses", description: "Data pelamar berhasil diperbarui." });

      } else {
        // Logika CREATE (POST) tetap sama
        for (const key in formData) { if (formData[key]) dataToSend.append(key, formData[key]); }
        dataToSend.append('formasi_id', formData.formasi);
        
        await api.post('/v1/pelamar/manual-create/', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({ title: "Sukses", description: "Pelamar baru berhasil ditambahkan." });
      }
      onSuccess();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      const errorMsg = axios.isAxiosError(error) && error.response ? JSON.stringify(error.response.data) : "Tidak dapat menyimpan data.";
      toast({ variant: "destructive", title: "Gagal", description: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
      <div className="font-bold border-b pb-2">Data Diri & Kontak</div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Email*</Label><Input name="email" type="email" value={formData.email || ''} onChange={handleChange}  /></div>
        <div><Label>Nama Lengkap*</Label><Input name="nama_lengkap" value={formData.nama_lengkap || ''} onChange={handleChange}  /></div>
        <div><Label>NIK*</Label><Input name="nik" value={formData.nik || ''} onChange={handleChange}  /></div>
        <div><Label>Tempat Lahir</Label><Input name="tempat_lahir" value={formData.tempat_lahir || ''} onChange={handleChange} /></div>
        <div><Label>Tanggal Lahir</Label><Input name="tanggal_lahir" type="date" value={formData.tanggal_lahir || ''} onChange={handleChange} /></div>
        <div><Label>Jenis Kelamin</Label>
          <Select name="jenis_kelamin" value={formData.jenis_kelamin || 'L'} onValueChange={(value) => handleSelectChange('jenis_kelamin', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>No. Telepon/HP</Label><Input name="no_telepon" value={formData.no_telepon || ''} onChange={handleChange} /></div>
        <div><Label>Pendidikan Terakhir</Label><Input name="pendidikan_terakhir" value={formData.pendidikan_terakhir || ''} placeholder="Contoh: S1 Keperawatan" onChange={handleChange} /></div>
      </div>
      
      <div className="font-bold border-b pb-2 pt-4">Alamat</div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Provinsi</Label><Input name="provinsi" value={formData.provinsi || ''} onChange={handleChange} /></div>
        <div><Label>Kabupaten/Kota</Label><Input name="kabupaten" value={formData.kabupaten || ''} onChange={handleChange} /></div>
        <div><Label>Kecamatan</Label><Input name="kecamatan" value={formData.kecamatan || ''} onChange={handleChange} /></div>
        <div><Label>Desa/Kelurahan</Label><Input name="desa" value={formData.desa || ''} onChange={handleChange} /></div>
      </div>
      <div><Label>Alamat Lengkap</Label><Textarea name="alamat_lengkap" value={formData.alamat_lengkap || ''} placeholder="Nama jalan, nomor rumah, RT/RW..." onChange={handleChange} /></div>
      
      {/* Tampilkan bagian ini hanya saat mode TAMBAH */}
          <div className="font-bold border-b pb-2 pt-4">Formasi & Berkas</div>
          <div className="space-y-3">
            <div><Label>Formasi yang Dilamar*</Label>
              <Select name="formasi" onValueChange={(value) => handleSelectChange('formasi', value)} >
                <SelectTrigger><SelectValue placeholder="Pilih Formasi" /></SelectTrigger>
                <SelectContent>
                  {formasiList.map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.nama_formasi}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          <div>
            <Label>Tanggal Lamaran (Disposisi)</Label>
            <Input 
              type="text" 
              value={new Date(formData.tanggal_lamar).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
              })}  
            />
          </div>
            <div><Label>Surat Lamaran (.pdf)*</Label><Input name="surat_lamaran" type="file" accept=".pdf" onChange={handleChange}  /></div>
            <div><Label>CV (.pdf)*</Label><Input name="cv" type="file" accept=".pdf" onChange={handleChange}  /></div>
            <div><Label>Ijazah (.pdf)*</Label><Input name="ijazah" type="file" accept=".pdf" onChange={handleChange}  /></div>
            <div><Label>Transkrip Nilai (.pdf)*</Label><Input name="transkrip_nilai" type="file" accept=".pdf" onChange={handleChange}  /></div>
            <div><Label>KTP (.pdf)*</Label><Input name="ktp" type="file" accept=".pdf" onChange={handleChange} /></div>
            <div><Label>STR (.pdf) (Opsional)</Label><Input name="str" type="file" accept=".pdf" onChange={handleChange} /></div>
          </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan Pelamar")}
        </Button>
      </div>
    </form>
  );
}