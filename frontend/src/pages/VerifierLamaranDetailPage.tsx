import { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox" // <-- Impor Checkbox
import type { FormEvent } from 'react';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

export default function VerifierLamaranDetailPage() {
  const { lamaranId } = useParams();
  const [lamaran, setLamaran] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // State untuk form input nilai
  const fetchDetail = async () => {
    try {
      const response = await api.get(`/v1/lamaran/${lamaranId}/`);
      setLamaran(response.data);
    } catch (error) {
      console.error("Gagal mengambil detail lamaran:", error);
      toast({ variant: "destructive", title: "Gagal memuat data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [lamaranId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Anda yakin ingin mengubah status menjadi "${newStatus.replace('_', ' ').toUpperCase()}"?`)) {
      return;
    }
    try {
      // Pastikan newStatus yang dikirim adalah 'lolos_verifikasi'
      await api.patch(`/v1/lamaran/${lamaranId}/update-status/`, {
        status: newStatus, 
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal memperbarui status." });
      console.error(error);
    }
  };

  const handleChecklistChange = async (dokumenId: number, fieldName: string, isChecked: boolean) => {
    // TAMBAHKAN PENGECEKAN INI
    if (!dokumenId) {
      console.error("Dokumen ID tidak ditemukan, request dibatalkan.");
      return;
    }
    
    try {
      await api.patch(`/v1/dokumen/${dokumenId}/update-checklist/`, {
        [fieldName]: isChecked,
      });
      fetchDetail();
    } catch (error) {
      console.error("Gagal update checklist", error);
      toast({ variant: "destructive", title: "Gagal update checklist." });
    }
  };

  if (loading) return <div>Loading data pelamar...</div>;
  if (!lamaran) return <div>Data lamaran tidak ditemukan.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{lamaran.pelamar.first_name || "Nama Belum Diisi"}</h1>
          <p className="text-muted-foreground">Melamar sebagai: {lamaran.formasi.nama_formasi}</p>
        </div>
        <Badge variant="outline" className="text-lg capitalize">{lamaran.status.replace('_', ' ')}</Badge>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Dokumen & Aksi */}
        <div className="md:col-span-1 space-y-6">
        <Card>
            <CardHeader><CardTitle>Dokumen Pelamar</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
              {lamaran.pelamar_profile?.pas_foto_url && (
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <Checkbox 
                         id="pas_foto" 
                         checked={lamaran.dokumen?.is_pas_foto_verified}
                         onCheckedChange={(checked) => handleChecklistChange(lamaran.dokumen.id, 'is_pas_foto_verified', Boolean(checked))}
                       />
                       <label htmlFor="pas_foto" className="capitalize text-sm">Pas Foto</label>
                    </div>
                    <a href={lamaran.pelamar_profile.pas_foto_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />Lihat
                      </Button>
                    </a>
                  </li>
                )}
                {Object.entries(lamaran.dokumen || {}).map(([key, value]) => {
                  if (value && !key.startsWith('is_') && key !== 'id' && key !== 'lamaran') {
                    const statusKey = `is_${key}_verified`;
                    const isChecked = lamaran.dokumen[statusKey];
                    return (
                      <li key={key} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                           <Checkbox 
                             id={key} 
                             checked={isChecked}
                             onCheckedChange={(checked) => handleChecklistChange(lamaran.dokumen.id, statusKey, Boolean(checked))}
                           />
                           <label htmlFor={key} className="capitalize text-sm font-medium">{key.replace(/_/g, ' ')}</label>
                        </div>
                        {/* PERBAIKAN DI SINI: Hapus ${BACKEND_URL} */}
                        <a href={value as string} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />Lihat
                          </Button>
                        </a>
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Aksi Verifikasi</CardTitle></CardHeader>
            <CardContent className="flex flex-col space-y-2">
              <Button onClick={() => handleUpdateStatus('lolos_verifikasi')} variant="default" className="bg-green-600 hover:bg-green-700">Lolos Verifikasi Berkas</Button>
              <Button onClick={() => handleUpdateStatus('gagal_verifikasi')} variant="destructive">Gagal Verifikasi Berkas</Button>
              <Button onClick={() => handleUpdateStatus('ditolak')} variant="outline">Ditolak (Final)</Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Kolom Kanan: Detail & Input */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Riwayat Aksi (Disposisi)</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lamaran.disposisi.map((item: any) => (
                  <li key={item.id} className="text-sm text-muted-foreground border-l-2 pl-2">
                    <p>{item.catatan}</p>
                    <p className="text-xs">{new Date(item.dibuat_pada).toLocaleString('id-ID')}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}