import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Users, Building, MapPin } from 'lucide-react';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

// Definisikan tipe data untuk statistik
interface FormasiStat {
  id: number;
  nama_formasi: string;
  kebutuhan: number;
  jumlah_pelamar: number;
}

interface DashboardStats {
  total_pelamar: number;
  pelamar_dalam_kota: number;
  pelamar_luar_kota: number;
  total_formasi_dibuka: number;
  statistik_formasi: FormasiStat[];
}

interface MyLamaran {
    id: number;
    formasi: { nama_formasi: string };
    status: string;
    tanggal_lamar: string;
  }
  
  export default function ApplicantStatsDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    // State untuk menyimpan daftar lamaran milik user
    const [myLamarans, setMyLamarans] = useState<MyLamaran[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Ambil data statistik dan data lamaran secara bersamaan
          const [statsRes, lamaranRes] = await Promise.all([
            api.get('/public/dashboard-stats/'),
            api.get('/pelamar/lamaran/')
          ]);
          setStats(statsRes.data);
          setMyLamarans(lamaranRes.data);
        } catch (error) {
          console.error("Gagal mengambil data dashboard:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  if (loading) {
    return <div>Loading statistik...</div>;
  }

  if (!stats) {
    return <div>Gagal memuat data statistik.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Pelamar</h1>
      
        {/* Bagian Status Lamaran Saya */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Status Lamaran Saya</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formasi Dilamar</TableHead>
                  <TableHead>Tanggal Lamar</TableHead>
                  <TableHead>Status Saat Ini</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myLamarans.length > 0 ? (
                  myLamarans.map((lamaran) => (
                    <TableRow key={lamaran.id}>
                      <TableCell className="font-medium">{lamaran.formasi.nama_formasi}</TableCell>
                      <TableCell>{new Date(lamaran.tanggal_lamar).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge className="capitalize">{lamaran.status.replace('_', ' ')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">Anda belum mengajukan lamaran.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* PERBARUI BAGIAN GRID KARTU INI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Seluruh Pelamar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_pelamar} Orang</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pelamar Dalam Kota</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pelamar_dalam_kota} Orang</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pelamar Luar Kota</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pelamar_luar_kota} Orang</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Formasi Dibuka</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_formasi_dibuka} Formasi</div>
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
                  <TableHead className="text-center">Jumlah Pelamar Saat Ini</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.statistik_formasi.map((formasi) => (
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