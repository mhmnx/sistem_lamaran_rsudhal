import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import axios from '@/lib/axios'; // pastikan path sesuai

type Informasi = {
  id: number;
  judul: string;
  tanggal_terbit: string;
  isi: string;
};

export default function InformationPage() {
  const [informasiList, setInformasiList] = useState<Informasi[]>([]);

  useEffect(() => {
    axios.get("/v1/informasi/")
      .then(res => setInformasiList(res.data))
      .catch(err => console.error("Gagal mengambil data informasi:", err));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pusat Informasi</h1>
      <p className="text-muted-foreground">
        Semua pengumuman dan informasi penting terkait proses lamaran akan ditampilkan di sini.
      </p>

      {informasiList.map(info => (
        <Card key={info.id}>
          <CardHeader>
            <CardTitle>{info.judul}</CardTitle>
            <CardDescription>Diterbitkan pada: {new Date(info.tanggal_terbit).toLocaleDateString('id-ID')}</CardDescription>
          </CardHeader>
          <CardContent>
          <p style={{ whiteSpace: 'pre-line' }}>{info.isi}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}