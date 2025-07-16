// frontend/src/pages/LandingPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Briefcase, Bell, Hospital, Target, Award, Building, MapPin } from 'lucide-react';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import Footer from '@/components/layout/Footer';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

export default function LandingPage() {
    const [stats, setStats] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
     
  useEffect(() => {
    // Ambil data statistik dan pengumuman
    const fetchData = async () => {
      try {
        const [statsRes, announcementsRes] = await Promise.all([
          api.get('/public/dashboard-stats/'),
          api.get('public/pengumuman/')
        ]);
        setStats(statsRes.data);
        setAnnouncements(announcementsRes.data);
      } catch (error) {
        console.error("Gagal memuat data landing page:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="py-20 text-center bg-white border-b">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Portal Rekrutmen Pegawai</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Bergabunglah bersama kami untuk memberikan pelayanan kesehatan terbaik kepada masyarakat.
          </p>
          <div className="mt-8">
          <GoogleLoginButton />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Statistik Lamaran</h2>
    

          {/* Tampilkan data jika sudah ada */}
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* PASTIKAN SEMUA NAMA PROPERTI DI SINI SUDAH BENAR */}
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
                  <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Formasi Dibuka</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{stats.total_formasi_dibuka} Formasi</div></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Rincian Pelamar per Formasi</CardTitle></CardHeader>
                <CardContent>
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
            </>
          )}
        </div>
      </section>
      {/* ======================================================= */}
      {/* BAGIAN BARU DITAMBAHKAN DI SINI */}
      {/* ======================================================= */}

      {/* Tentang Kami Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img src="/img/rsud.png" alt="Tentang RSUD" className="rounded-lg shadow-lg" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Tentang Kami</h2>
              <p className="text-muted-foreground">
                RSUD Hj. Anna Lasmanah adalah pilar utama pelayanan kesehatan di Banjarnegara, berdedikasi untuk memberikan perawatan berkualitas tinggi dengan standar profesionalisme dan empati. Sejak didirikan, kami terus berinovasi untuk memenuhi kebutuhan kesehatan masyarakat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      {/* Visi & Misi Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Visi & Misi</h2>
          
          {/* PERBAIKAN: Gunakan grid dan `items-start` agar kolom sejajar di atas */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            
            {/* Kolom Visi */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full"><Target /></div>
                <h3 className="text-2xl font-semibold">Visi</h3>
              </div>
              {/* PERBAIKAN: `text-justify` untuk merapikan paragraf panjang */}
              <p className="text-muted-foreground">“Menjadi Rumah Sakit Pilihan Utama Masyarakat Banjarnegara dan Sekitarnya”</p>
            </div>
            <div className="space-y-3">
               <div className="flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full"><Award /></div>
                <h3 className="text-2xl font-semibold">Misi</h3>
              </div>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Mewujudkan pelayanan kesehatan yang berorientasi pada peningkatan mutu dan keselamatan pasien.</li>
                <li>Meningkatkan sumber daya manusia yang profesional dan berintegritas.</li>
                <li>Meningkatkan sarana prasarana guna memperluas jangkauan pelayanan kesehatan rujukan.</li>
                <li>Mengembangkan pelayanan unggulan untuk mendukung program prioritas bidang kesehatan rujukan.</li>
                <li>Mewujudkan sistem manajemen yang efektif, efisien,transparan dan responsif.</li>
                <li>Mewujudkan rumah sakit sebagai pusat pendidikan, penelitian dan melaksanakan kegiatan pengabdian masyarakat.</li>
                </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Berkarir Bersama Kami Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Berkarir Bersama Kami</h2>
              <p className="text-muted-foreground mb-6">
                Kami percaya bahwa sumber daya manusia adalah aset terbesar kami. Bergabunglah dengan tim profesional kami dan kembangkan karir Anda dalam lingkungan yang mendukung, inovatif, dan penuh kesempatan.
              </p>
              <Link to="/formasi">
                <Button size="lg" variant="outline">Lihat Semua Lowongan</Button>
              </Link>
            </div>
            <div>
              <img src="/img/dokter.png" alt="Karir di RSUD" className="rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Pengumuman Terbaru</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            
            {/* PASTIKAN BAGIAN INI SUDAH BENAR */}
            {announcements.length > 0 ? (
              announcements.map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" /> 
                      {item.judul} {/* Pastikan Anda mengakses item.judul */}
                    </CardTitle>
                    <CardDescription>
                      {new Date(item.tanggal_terbit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* PASTIKAN ANDA MENGAKSES item.konten DI SINI */}
                    <p>{item.isi}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                {loading ? "Memuat pengumuman..." : "Belum ada pengumuman."}
              </p>
            )}
            {/* AKHIR BAGIAN YANG PERLU DIPERIKSA */}

          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}