// frontend/src/pages/LandingPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Briefcase, Bell, Target, Award, Building, MapPin, LogIn, User, FileText, BellRing, Trophy, Mail, Phone } from 'lucide-react';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import Footer from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input"; // Impor komponen tambahan
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LandingPageHeader from '@/components/layout/LandingPageHeader'; // <-- 1. Impor header baru
import { useNavigate } from 'react-router-dom'; // 1. Impor useNavigate
import { useAuth } from '@/contexts/AuthContext'; // 2. Impor useAuth

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});


const alurData = [
  {
    icon: <LogIn />,
    title: "1. Login & Buat Akun",
    description: "Masuk dengan akun Google Anda untuk memulai proses pendaftaran.",
  },
  {
    icon: <User />,
    title: "2. Lengkapi Profil",
    description: "Isi data diri, alamat, dan pendidikan Anda secara lengkap dan benar.",
  },
  {
    icon: <FileText />,
    title: "3. Pilih Formasi & Unggah Berkas",
    description: "Pilih satu formasi yang sesuai dan unggah semua dokumen yang diperlukan.",
  },
  {
    icon: <BellRing />,
    title: "4. Pengumuman & Ujian",
    description: "Pantau terus halaman informasi untuk pengumuman verifikasi berkas, jadwal ujian, hingga hasil akhir.",
  },
  {
    icon: <Trophy />,
    title: "5. Diterima",
    description: "Selamat! Anda berhasil menjadi bagian dari tim kami.",
  },
];

// Data untuk FAQ
const faqData = [
  {
    question: "Bisakah saya melamar lebih dari satu formasi?",
    answer: "Tidak. Untuk saat ini, setiap pelamar hanya diizinkan untuk mengajukan satu lamaran aktif pada satu formasi untuk menjaga keadilan dan fokus dalam proses seleksi."
  },
  {
    question: "Apa saja dokumen yang diperlukan?",
    answer: "Dokumen wajib meliputi Surat Lamaran, CV, Ijazah, Transkrip Nilai, dan KTP. Beberapa formasi mungkin memerlukan dokumen tambahan seperti STR (Surat Tanda Registrasi) yang valid."
  },
  {
    question: "Bagaimana saya tahu status lamaran saya?",
    answer: "Setelah Anda login, Anda dapat melihat status terkini dari lamaran Anda langsung di halaman dashboard pelamar."
  },
  {
    question: "Apakah ada batasan ukuran atau format file untuk dokumen?",
    answer: "Ya, semua dokumen harus diunggah dalam format .PDF dengan ukuran maksimal 2MB per file."
  },
];

const handleHelpdeskSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  alert("Fitur kirim pesan akan segera tersedia.");
  // TODO: Implementasi logika pengiriman form (misal: menggunakan Formspree atau endpoint API email)
};
export default function LandingPage() {
  const [stats, setStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Panggil hook untuk navigasi dan autentikasi
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // useEffect untuk mengambil data publik
    const fetchData = async () => {
      try {
        const [statsRes, announcementsRes] = await Promise.all([
          api.get('/public/dashboard-stats/'),
          api.get('/public/pengumuman/')
        ]);
        setStats(statsRes.data);
        setAnnouncements(announcementsRes.data);
      } catch (error) {
        console.error("Gagal memuat data landing page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. TAMBAHKAN useEffect BARU INI UNTUK MENANGANI REDIRECT
  useEffect(() => {
    // Jika user sudah login, jalankan logika pengalihan
    if (isAuthenticated && user) {
      const internalRoles = ['verifikator', 'superadmin', 'penilai_wawancara', 'penilai_keterampilan'];
      if (internalRoles.includes(user.role)) {
        navigate('/verifier/dashboard');
      } else {
        navigate('/pelamar/dashboard');
      }
    }
    // Jika tidak login, biarkan landing page ditampilkan
  }, [isAuthenticated, user, navigate]);


  // 4. Jika user sudah login, tampilkan pesan loading saat proses redirect

  return (
    <div id="hero-section" className="bg-slate-50">
      <LandingPageHeader /> {/* <-- 2. Gunakan komponen header di sini */}
      {/* Hero Section */}
      <section className="relative py-20 text-center border-b overflow-hidden">
        
        {/* 2. Layer untuk gambar background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40" 
          style={{ backgroundImage: `url('/img/background.jpg')` }}
        ></div>

        {/* Layer untuk efek gelap agar teks lebih terbaca */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* 3. Layer untuk konten teks, diberi posisi `relative` */}
        <div className="relative z-10 container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Portal Rekrutmen Pegawai</h1>
          <p className="text-lg text-slate-200 mt-4 max-w-2xl mx-auto">
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
                      {/* PERBAIKAN UTAMA DI SINI */}
                      {/* Pastikan `stats.statistik_formasi` ada dan merupakan array */}
                      {stats.statistik_formasi && stats.statistik_formasi.length > 0 ? (
                        stats.statistik_formasi.map((formasi: any) => (
                          <TableRow key={formasi.id}>
                            <TableCell className="font-medium">{formasi.nama_formasi}</TableCell>
                            <TableCell className="text-center">{formasi.kebutuhan}</TableCell>
                            <TableCell className="text-center">{formasi.jumlah_pelamar}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            Tidak ada rincian formasi untuk ditampilkan.
                          </TableCell>
                        </TableRow>
                      )}
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
      {/* ======================================================= */}
      {/* GANTI SELURUH SECTION ALUR PENDAFTARAN DENGAN INI */}
      {/* ======================================================= */}
      <section id="alur-pendaftaran" className="py-20 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Alur Pendaftaran</h2>
          
          <div className="relative wrap overflow-hidden p-10 h-full">
            {/* Garis vertikal di tengah */}
            <div className="absolute border-opacity-20 border-gray-700 h-full border" style={{left: '50%'}}></div>

            {/* Mapping data alur */}
            {alurData.map((item, index) => (
              // Tentukan apakah item berada di kiri atau kanan
              <div key={index} className={`mb-8 flex justify-between items-center w-full ${index % 2 === 0 ? 'flex-row-reverse left-timeline' : 'right-timeline'}`}>
                <div className="order-1 w-5/12"></div>
                
                {/* Lingkaran Ikon di Tengah */}
                <div className="z-20 flex items-center order-1 bg-indigo-600 shadow-xl w-12 h-12 rounded-full">
                  <div className="h-full w-full text-white flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                
                {/* Konten Teks */}
                <div className={`order-1 bg-white rounded-lg shadow-xl w-5/12 px-6 py-4 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <h3 className="font-bold text-gray-800 text-xl">{item.title}</h3>
                  <p className="text-sm leading-snug tracking-wide text-gray-500 text-opacity-100">{item.description}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
      {/* Announcements Section */}
      <section id="pengumuman" className="py-16 bg-slate-50">
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
      {/* ======================================================= */}
      {/* BAGIAN BARU DITAMBAHKAN DI SINI */}
      {/* ======================================================= */}

      {/* Tentang Kami Section */}
      <section id="aboutus" className="py-20 bg-white">
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
            {/* Kolom Misi */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full"><Award /></div>
                <h3 className="text-2xl font-semibold">Misi</h3>
              </div>
              <ul className="list-disc list-outside text-muted-foreground pl-6 space-y-2 leading-relaxed marker:text-indigo-500">
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
       {/* ======================================================= */}
      {/* BAGIAN BARU DITAMBAHKAN DI SINI */}
      {/* ======================================================= */}
      <section id="faq" className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Pertanyaan Umum (FAQ)</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((item, index) => (
                <AccordionItem value={`item-${index + 1}`} key={index}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
      {/* ======================================================= */}
      {/* BAGIAN BARU DITAMBAHKAN DI SINI */}
      {/* ======================================================= */}
      <section id="helpdesk" className="py-20 bg-white border-t">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Butuh Bantuan?</h2>
            <p className="text-muted-foreground mt-2">Hubungi kami jika Anda memiliki pertanyaan atau mengalami kendala.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            
            {/* Kolom Kiri: Informasi Kontak */}
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 mr-4 mt-1 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-lg">Alamat Kantor</h3>
                  <p className="text-muted-foreground">Jl. Jend. Sudirman No.42, Kutabanjarnegara, Kec. Banjarnegara, Kab. Banjarnegara, Jawa Tengah 53474</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 mr-4 mt-1 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-lg">Email Resmi</h3>
                  <p className="text-muted-foreground">rekrutmen@rsudbanjarnegara.go.id</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 mr-4 mt-1 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-lg">Telepon (Jam Kerja)</h3>
                  <p className="text-muted-foreground">(0286) 591464 ext. 112</p>
                  <p className="text-muted-foreground">(0286) 591464 ext. 112</p>
                  <p className="text-muted-foreground">(0286) 591464 ext. 112</p>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Form Kontak */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Kirim Pesan</CardTitle>
                  <CardDescription>Isi form di bawah ini dan tim kami akan segera merespons.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleHelpdeskSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Anda</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Anda</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Pesan Anda</Label>
                      <Textarea id="message" placeholder="Tuliskan pertanyaan atau kendala Anda di sini..." />
                    </div>
                    <Button type="submit" className="w-full">Kirim Pesan</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}