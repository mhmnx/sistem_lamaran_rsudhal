// frontend/src/pages/VerifierDashboardPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Briefcase, Building, MapPin } from 'lucide-react'; // Impor ikon baru
import { ApplicantTrendChart } from '@/components/charts/ApplicantTrendChart';
import { FormasiCompositionChart } from '@/components/charts/FormasiCompositionChart';



const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

// Definisikan interface agar kode lebih rapi
interface Formasi { id: number; nama_formasi: string; }

export default function VerifierDashboardPage() {
  const [stats, setStats] = useState<any>(null); // State untuk menampung semua statistik

  useEffect(() => {
    // Panggil endpoint statistik yang sudah diperbarui
    api.get('/v1/dashboard-stats/')
      .then(res => setStats(res.data))
      .catch(err => console.error("Gagal fetch data statistik:", err));
  }, []);

  if (!stats) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
       {/* Kartu Statistik Lengkap */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Pelamar</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total_pelamar} Orang</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pelamar Dalam Kota</CardTitle><Building className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.pelamar_dalam_kota} Orang</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pelamar Luar Kota</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.pelamar_luar_kota} Orang</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Formasi</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total_formasi_dibuka} Formasi</div></CardContent>
        </Card>
      </div>

      {/* Area Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Grafik Penerimaan Pelamar</CardTitle>
            <CardDescription>Tren jumlah pelamar yang masuk setiap bulannya.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.tren_bulanan && <ApplicantTrendChart data={stats.tren_bulanan} />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Komposisi Formasi</CardTitle>
            <CardDescription>Perbandingan jumlah pelamar antar formasi.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.statistik_formasi && <FormasiCompositionChart data={stats.statistik_formasi} />}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Rincian Formasi</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Formasi</TableHead>
                  <TableHead className="text-center">Kebutuhan</TableHead>
                  <TableHead className="text-center">Jumlah Pelamar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.statistik_formasi.map((formasi: any) => (
                  <TableRow key={formasi.id}>
                    <TableCell className="font-medium">{formasi.nama_formasi}</TableCell>
                    <TableCell className="text-center">{formasi.kebutuhan}</TableCell>
                    <TableCell className="text-center">{formasi.jumlah_pelamar}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
    

  );
  
}