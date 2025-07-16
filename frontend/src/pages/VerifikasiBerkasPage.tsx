import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

export default function VerifikasiBerkasPage() {
  const [lamaranList, setLamaranList] = useState<any[]>([]);
  const [formasiList, setFormasiList] = useState<any[]>([]);
  const [selectedFormasi, setSelectedFormasi] = useState('');

  useEffect(() => {
    api.get('/formasi/').then(res => setFormasiList(res.data));

    const params = new URLSearchParams();
    // HAPUS filter status 'diajukan' agar semua lamaran muncul
    // params.append('status', 'diajukan'); 
    
    if (selectedFormasi) {
      params.append('formasi', selectedFormasi);
    }
    
    api.get(`/v1/lamaran/?${params.toString()}`)
      .then(res => setLamaranList(res.data))
      .catch(err => console.error("Gagal fetch data lamaran:", err));

  }, [selectedFormasi]);

  const getStatusVariant = (status: string) => {
    if (status.includes('lolos')) return 'success';
    if (status.includes('gagal') || status.includes('ditolak')) return 'destructive';
    return 'default';
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Verifikasi Berkas</h1>
      <p className="text-muted-foreground mb-4">Daftar semua pelamar dan status verifikasi berkasnya.</p>
      
      {/* Area Filter */}
      <div className="flex items-center gap-4 mb-4">
        <Select onValueChange={value => setSelectedFormasi(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filter Berdasarkan Formasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Formasi</SelectItem>
            {formasiList.map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.nama_formasi}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabel Data */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Pelamar</TableHead>
              <TableHead>Formasi Dilamar</TableHead>
              {/* TAMBAHKAN KOLOM BARU INI */}
              <TableHead>Status Verifikasi</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lamaranList.length > 0 ? (
              lamaranList.map(lamaran => (
                <TableRow key={lamaran.id}>
                  <TableCell className="font-medium">{lamaran.pelamar.first_name || lamaran.pelamar.email}</TableCell>
                  <TableCell>{lamaran.formasi.nama_formasi}</TableCell>
                  {/* TAMPILKAN STATUS DENGAN BADGE */}
                  <TableCell>
                    <Badge variant={getStatusVariant(lamaran.status)} className="capitalize">
                      {lamaran.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link to={`/verifier/lamaran/${lamaran.id}`} className="text-indigo-600 hover:underline font-semibold">
                      Periksa / Ubah Status
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Tidak ada data untuk ditampilkan.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}