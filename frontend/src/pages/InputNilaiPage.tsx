import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel } from '@tanstack/react-table';
import type { SortingState } from  '@tanstack/react-table'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Save } from 'lucide-react'; // Impor ikon untuk tomb
import type { ColumnDef } from '@tanstack/react-table';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});
const JENIS_TES_LIST = ['tes_cat', 'keterampilan', 'psikotest', 'wawancara'];


const NilaiInput = ({ lamaranId, jenisTes, initialValue }: any) => {
  const [nilai, setNilai] = useState(initialValue);
  const { toast } = useToast(); // Inisialisasi hook toast

  const handleSave = async () => {
    // Jangan kirim request jika nilainya tidak berubah
    if (nilai === initialValue || nilai === '') return;

    try {
      await api.post(`/v1/lamaran/${lamaranId}/nilai/upsert/`, {
        jenis_tes: jenisTes,
        nilai: parseFloat(nilai),
      });

      // Tampilkan notifikasi sukses
      toast({
        title: "Sukses",
        description: `Nilai untuk ${jenisTes.replace('_',' ')} berhasil disimpan.`,
      });

    } catch (err) {
      console.error("Gagal simpan nilai", err);
      // Tampilkan notifikasi error
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Tidak dapat menyimpan nilai."
      });
    }
  };
  
  return <Input type="number" step="0.01" value={nilai} onChange={e => setNilai(e.target.value)} onBlur={handleSave} className="w-24" />;
};


  
// Tipe data untuk kolom
type LamaranData = {
  id: number;
  pelamar: { first_name: string; nik: string }; // Pastikan nik ada di sini
  nilai_tes: { jenis_tes: string; nilai: number }[];
  status_kelulusan: string | null;
  keterangan: string | null;
}

// Komponen input yang bisa dipakai ulang untuk nilai dan keterangan
const EditableCell = ({ lamaranId, field, initialValue, type = 'text' }: any) => {
  const [value, setValue] = useState(initialValue || '');
  const { toast } = useToast(); // Inisialisasi hook toast

  const handleSave = async () => {
    if (value === initialValue) return;

    try {
      await api.patch(`/v1/lamaran/${lamaranId}/`, { [field]: value });

      // Tampilkan notifikasi sukses
      toast({
        title: "Sukses",
        description: `Kolom ${field.replace('_', ' ')} berhasil diperbarui.`,
      });

    } catch (err) {
      console.error(`Gagal simpan ${field}`, err);
      // Tampilkan notifikasi error
      toast({
        variant: "destructive",
        title: "Gagal",
        description: `Tidak dapat memperbarui kolom ${field.replace('_', ' ')}.`,
      });
    }
  };

  if (type === 'select') {
    return (
      <Select value={value} onValueChange={(val) => { 
        setValue(val); 
        // Langsung panggil handleSave setelah nilai berubah
        api.patch(`/v1/lamaran/${lamaranId}/`, { [field]: val })
           .then(() => toast({ title: "Sukses", description: "Status kelulusan berhasil diperbarui." }))
           .catch(() => toast({ variant: "destructive", title: "Gagal", description: "Tidak dapat memperbarui status." }));
      }}>
        <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="lulus">Lulus</SelectItem>
          <SelectItem value="tidak_lulus">Tidak Lulus</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  
  return <Input value={value} onChange={e => setValue(e.target.value)} onBlur={handleSave} />;
};


export default function InputNilaiPage() {
  // PERBAIKAN 1: Gunakan satu state saja, yaitu 'data' dan 'setData'
  const [data, setData] = useState<LamaranData[]>([]);
  const [formasiList, setFormasiList] = useState<any[]>([]);
  const [selectedFormasi, setSelectedFormasi] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const componentRef = useRef<HTMLDivElement>(null);
  const [initialData, setInitialData] = useState<any[]>([]); // Untuk membandingkan perubahan
  const { toast } = useToast();
  const fetchData = () => {
    if (selectedFormasi) {
      const params = new URLSearchParams();
      params.append('formasi', selectedFormasi);
      params.append('status', 'lolos_verifikasi');
      
      api.get(`/v1/lamaran/?${params.toString()}`).then(res => {
        setData(res.data);
        // Simpan salinan data awal untuk perbandingan saat menyimpan
        setInitialData(JSON.parse(JSON.stringify(res.data)));
      });
    } else {
      setData([]);
      setInitialData([]);
    }
  };
  const payload: any[] = [];
  const [pengaturanCetak, setPengaturanCetak] = useState({
    tempat: 'Banjarnegara',
    jabatan: 'Direktur RSUD Hj. Anna Lasmanah',
    nama: 'dr. Erna Astuty',
    nip: '197108302000122001'
  });
  const { user } = useAuth(); // Ambil data user
  const updateData = useCallback((rowIndex: number, columnId: string, value: any) => {
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          const newRow = { ...row };
          if (columnId === 'status_kelulusan' || columnId === 'keterangan') {
            newRow[columnId] = value;
          } else {
            const newNilaiTes = [...newRow.nilai_tes];
            const nilaiIndex = newNilaiTes.findIndex((n: any) => n.jenis_tes === columnId);
            if (nilaiIndex > -1) {
              newNilaiTes[nilaiIndex] = { ...newNilaiTes[nilaiIndex], nilai: parseFloat(value) || 0 };
            } else {
              newNilaiTes.push({ jenis_tes: columnId, nilai: parseFloat(value) || 0 });
            }
            newRow.nilai_tes = newNilaiTes;
          }
          return newRow;
        }
        return row;
      })
    );
  }, []);
  
  useEffect(() => {
    api.get('/v1/pengaturan-cetak/')
      .then(res => setPengaturanCetak(res.data))
      .catch(err => console.error('Gagal ambil pengaturan cetak:', err));
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedFormasi]);

  const handleSaveAll = async () => {
    const nilaiPayload: any[] = [];
    const lamaranPayload: any[] = [];

    // Bandingkan data saat ini dengan data awal untuk menemukan perubahan
    data.forEach((row, rowIndex) => {
      const initialRow = initialData[rowIndex];
      if (!initialRow) return;

      // Cek perubahan pada setiap nilai tes
      JENIS_TES_LIST.forEach(jenisTes => {
        const currentNilaiObj = row.nilai_tes.find((n: any) => n.jenis_tes === jenisTes);
        const initialNilaiObj = initialRow.nilai_tes.find((n: any) => n.jenis_tes === jenisTes);
        
        const currentNilai = currentNilaiObj ? currentNilaiObj.nilai : 0;
        const initialNilai = initialNilaiObj ? initialNilaiObj.nilai : 0;

        if (currentNilai !== initialNilai) {
          nilaiPayload.push({ 
            lamaran_id: row.id, 
            jenis_tes: jenisTes, 
            nilai: currentNilai 
          });
        }
      });
      
      // Cek perubahan pada status kelulusan dan keterangan
      if (row.status_kelulusan !== initialRow.status_kelulusan || row.keterangan !== initialRow.keterangan) {
        // PERBAIKAN UTAMA DI SINI
        lamaranPayload.push({
          id: row.id,
          // Bungkus data dalam 'pelamar_profile'
          pelamar_profile: { 
            status_kelulusan: row.status_kelulusan,
            keterangan: row.keterangan,
          }
        });
      }
    });

    if (nilaiPayload.length === 0 && lamaranPayload.length === 0) {
      return toast({ title: "Info", description: "Tidak ada perubahan untuk disimpan." });
    }

    // Kirim request ke API jika ada perubahan
    try {
      const promises = [];
      if (nilaiPayload.length > 0) {
        promises.push(api.post('/v1/lamaran/bulk-update-nilai/', nilaiPayload));
      }
      if (lamaranPayload.length > 0) {
        // Gunakan endpoint PATCH yang sudah ada untuk update lamaran
        // Kita akan mengirim satu per satu untuk sementara
        lamaranPayload.forEach(payload => {
            promises.push(api.patch(`/v1/lamaran/${payload.id}/`, payload));
        });
      }
      
      await Promise.all(promises);

      toast({ title: "Sukses!", description: "Semua perubahan berhasil disimpan." });
      fetchData(); // Muat ulang data untuk sinkronisasi
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Tidak dapat menyimpan semua perubahan." });
      console.error("Gagal menyimpan perubahan:", error);
    }
  };
  

  const handlePrintPDFFormal = () => {
    // PERUBAHAN 1: Mengubah layout menjadi Portrait ('p')
    const doc = new jsPDF('p', 'mm', 'a4'); 
  
    // ✅ Judul laporan
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    // PERUBAHAN 2: Menyesuaikan posisi X untuk judul di layout portrait (lebar A4: 210mm)
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.text('LAPORAN HASIL AKHIR SELEKSI PENERIMAAN PEGAWAI', centerX, 15, { align: 'center' });
    doc.text('RSUD Hj. ANNA LASMANAH BANJARNEGARA', centerX, 22, { align: 'center' });
    
    const formasiNama = formasiList.find(f => f.id.toString() === selectedFormasi)?.nama_formasi || '';
    doc.text(`FORMASI: ${formasiNama.toUpperCase()} TAHUN ${new Date().getFullYear()}`, centerX, 29, { align: 'center' });
  
    // ✅ Sort data berdasarkan total nilai descending
    const sortedData = [...data].sort((a, b) => {
      const totalA = a.nilai_tes.reduce((sum, n) => sum + (n.nilai || 0), 0);
      const totalB = b.nilai_tes.reduce((sum, n) => sum + (n.nilai || 0), 0);
      return totalB - totalA;
    });
  
    // ✅ Mapping data ke table
    const tableData = sortedData.map((row, index) => {
      const total = row.nilai_tes.reduce((sum, n) => sum + (n.nilai || 0), 0);
      return [
        index + 1,
        row.pelamar.first_name,
        row.pelamar.nik || '-',
        row.nilai_tes.find(n => n.jenis_tes === 'tes_cat')?.nilai || 0,
        row.nilai_tes.find(n => n.jenis_tes === 'keterampilan')?.nilai || 0,
        row.nilai_tes.find(n => n.jenis_tes === 'psikotest')?.nilai || 0,
        row.nilai_tes.find(n => n.jenis_tes === 'wawancara')?.nilai || 0,
        total.toFixed(1),
        row.status_kelulusan ? row.status_kelulusan.replace('_', ' ').toUpperCase() : 'TIDAK LULUS'
      ];
    });
  
    // ✅ Membuat table
    // Konfigurasi autoTable yang sudah diperbaiki
    autoTable(doc, {
      startY: 35,
      head: [
        [
          // PERBAIKAN 1: Menambahkan style align center secara eksplisit
          { content: 'PERINGKAT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'NAMA LENGKAP', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'NIK', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'NILAI TES', colSpan: 4, styles: { halign: 'center' } },
          { content: 'TOTAL NILAI', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'KETERANGAN', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        ],
        [
          { content: 'CAT' },
          { content: 'KETERAMPILAN' },
          { content: 'PSIKOTEST' },
          { content: 'WAWANCARA' },
        ],
      ],
      body: tableData,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { 
        fillColor: [220, 220, 220], // Warna abu-abu muda untuk header
        textColor: 0, 
        fontSize: 7, 
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1, // Border untuk header
        lineColor: [0, 0, 0]
      },
      bodyStyles: { halign: 'center', valign: 'middle', lineColor: [0, 0, 0] },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1,
      theme: 'grid',
      columnStyles: {
        // PERBAIKAN 2: Menyesuaikan lebar kolom agar teks tidak tumpang tindih
        0: { cellWidth: 18 },                  // PERINGKAT
        1: { cellWidth: 'auto', halign: 'left' }, // NAMA LENGKAP
        2: { cellWidth: 28 },                  // NIK
        3: { cellWidth: 10 },                  // CAT
        4: { cellWidth: 24 },                  // KETERAMPILAN
        5: { cellWidth: 18 },                  // PSIKOTEST
        6: { cellWidth: 21 },                  // WAWANCARA
        7: { cellWidth: 15 },                  // TOTAL NILAI
        8: { cellWidth: 'auto' },               // KETERANGAN
      },
      didDrawPage: (data) => {
        doc.line(15, 32, doc.internal.pageSize.getWidth() - 15, 32);
      },
      margin: { top: 35, left: 15, right: 15 },
    });
  
    // PERUBAHAN 4: Menambahkan blok tanda tangan setelah tabel
    const finalY = (doc as any).lastAutoTable.finalY; // Ambil posisi Y terakhir dari tabel
    const signatureX = 130; // Posisi X untuk blok tanda tangan (sisi kanan)
    const signatureY = finalY + 15; // Beri jarak 15mm dari bawah tabel

    // Format tanggal saat ini (contoh: 11 Juli 2025)
    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text(`${pengaturanCetak.tempat}, ${formattedDate}`, signatureX, signatureY);
    doc.text(pengaturanCetak.jabatan, signatureX, signatureY + 5);
    doc.text(pengaturanCetak.nama, signatureX, signatureY + 25);
    doc.setLineWidth(0.2);
    doc.line(signatureX, signatureY + 26, signatureX + 50, signatureY + 26);
    doc.text(`NIP: ${pengaturanCetak.nip}`, signatureX, signatureY + 30);

    doc.save(`Laporan_Hasil_Akhir_${formasiNama}_${new Date().getFullYear()}.pdf`);
};
  
  // Definisi kolom dipindahkan ke useMemo agar tidak dibuat ulang setiap render
  const columns = useMemo(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "pelamar_profile.nama_lengkap",
        header: "Nama Lengkap",
      },
    ];

    let nilaiColumns: ColumnDef<any>[] = [];
    const userRole = user?.role;

    const createSortableHeader = (title: string) => ({ column }: any) => (
      <Button
        variant="ghost"
        // Gunakan handler bawaan dari TanStack Table
        onClick={column.getToggleSortingHandler()}
      >
        {title}
        {/* Tampilkan ikon berdasarkan status sortir */}
        {column.getIsSorted() === 'asc' && <ArrowUpDown className="ml-2 h-4 w-4" />}
        {column.getIsSorted() === 'desc' && <ArrowUpDown className="ml-2 h-4 w-4" />}
        {!column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />}
      </Button>
    );
    // Fungsi helper untuk menyimpan nilai individu
    const saveNilai = async (lamaranId: number, field: string, value: any) => {
      try {
        let response;
        // Tentukan endpoint berdasarkan field yang diubah
        if (JENIS_TES_LIST.includes(field)) {
          response = await api.post(`/v1/lamaran/${lamaranId}/nilai/upsert/`, { jenis_tes: field, nilai: parseFloat(value) || 0 });
        } else {
          response = await api.patch(`/v1/lamaran/${lamaranId}/`, { [field]: value });
        }
        
        toast({ title: "Tersimpan", description: `Perubahan pada ${field.replace('_', ' ')} berhasil disimpan.` });
        // Perbarui state lokal dengan data dari respons untuk sinkronisasi
        fetchData();
      } catch (error) {
        toast({ variant: "destructive", title: "Gagal", description: `Tidak dapat menyimpan perubahan.` });
        console.error("Gagal menyimpan perubahan:", error);
      }
    };

    if (userRole === 'penilai_wawancara') {
      nilaiColumns = [{
        id: 'wawancara',
        header: createSortableHeader('Wawancara'),
        // accessorFn dibutuhkan untuk sorting
        accessorFn: (row: any) => row.nilai_tes.find((n: any) => n.jenis_tes === 'wawancara')?.nilai || 0,
          cell: ({ row }) => {
            const initialValue = row.original.nilai_tes.find((n: any) => n.jenis_tes === 'wawancara')?.nilai || '';
            return (
              <Input
                type="number"
                defaultValue={initialValue}
                // onBlur akan langsung menyimpan nilai
                onBlur={(e) => saveNilai(row.original.id, 'wawancara', e.target.value)}
                className="w-24"
              />
            );
          },
        },
      ];
    } else if (userRole === 'penilai_keterampilan') {
      nilaiColumns = [{
        id: 'keterampilan',
        header: createSortableHeader('Keterampilan'),
        // accessorFn dibutuhkan untuk sorting
        accessorFn: (row: any) => row.nilai_tes.find((n: any) => n.jenis_tes === 'keterampilan')?.nilai || 0,
          cell: ({ row }) => {
            const initialValue = row.original.nilai_tes.find((n: any) => n.jenis_tes === 'keterampilan')?.nilai || '';
            return (
              <Input
                type="number"
                defaultValue={initialValue}
                // onBlur akan langsung menyimpan nilai
                onBlur={(e) => saveNilai(row.original.id, 'keterampilan', e.target.value)}
                className="w-24"
              />
            );
          },
        },
      ];
    } else if (userRole === 'verifikator' || userRole === 'superadmin') {
      // Untuk verifikator/superadmin, buat semua kolom nilai bisa disortir
      nilaiColumns = JENIS_TES_LIST.map(jenisTes => ({
        id: jenisTes,
        header: createSortableHeader(jenisTes.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
        // accessorFn dibutuhkan untuk sorting
        accessorFn: (row: any) => row.nilai_tes.find((n: any) => n.jenis_tes === jenisTes)?.nilai || 0,
        cell: ({ row }: any) => {
          const value = row.original.nilai_tes.find((n: any) => n.jenis_tes === jenisTes)?.nilai || '';
          return (
            <Input
              type="number"
              defaultValue={value}
              className="w-24"
              onBlur={(e) => {
                const newValue = e.target.value;
                updateData(row.index, jenisTes, newValue);      // Update lokal
                saveNilai(row.original.id, jenisTes, newValue); // Simpan ke backend
              }}
            />
          );
        }
      }));
    }
    
    const finalColumns: ColumnDef<any>[] = (userRole === 'verifikator' || userRole === 'superadmin') ? [
      {
        id: 'total_nilai',
        header: createSortableHeader('Total Nilai'),
        accessorFn: (row: any) => row.nilai_tes.reduce((sum: number, n: any) => sum + (n.nilai || 0), 0),
        cell: ({ row }) => {
          const total = row.original.nilai_tes.reduce((sum: number, n: any) => sum + (n.nilai || 0), 0);
          return <div className="font-bold text-center">{total.toFixed(2)}</div>;
        }
      },
      {
        accessorKey: 'status_kelulusan',
        header: createSortableHeader('Status Lulus'),
        cell: ({ row }) => {
          const value = row.original.status_kelulusan;
          return (
            <Select
              defaultValue={value}
              onValueChange={(newValue) => {
                updateData(row.index, 'status_kelulusan', newValue);       // update lokal
                saveNilai(row.original.id, 'status_kelulusan', newValue);  // simpan ke backend
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lulus">Lulus</SelectItem>
                <SelectItem value="tidak_lulus">Tidak Lulus</SelectItem>
              </SelectContent>
            </Select>
          );
        }
      },
      {
        accessorKey: 'keterangan',
        header: 'Keterangan',
        cell: ({ row }) => {
          const value = row.original.keterangan;
          return (
            <Input 
              defaultValue={value}
              onBlur={(e) => {
                const val = e.target.value;
                updateData(row.index, 'keterangan', val);           // update lokal
                saveNilai(row.original.id, 'keterangan', val);      // simpan ke backend
              }}
            />
          );
        }
      }
      
    ] : [];

    return [...baseColumns, ...nilaiColumns, ...finalColumns];

  }, [data, user, updateData, toast]); // <-- Penting: tambahkan 'data' sebagai dependensi


  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), onSortingChange: setSorting, state: { sorting } });
  useEffect(() => {
    api.get('/formasi/').then(res => setFormasiList(res.data));
    
    if (selectedFormasi) {
      const params = new URLSearchParams();
      params.append('formasi', selectedFormasi);
      params.append('status', 'lolos_verifikasi'); 
      
      api.get(`/v1/lamaran/?${params.toString()}`)
        .then(res => {
          // PERBAIKAN 1: Simpan hasil ke state 'data'
          setData(res.data);
        })
        .catch(err => {
          console.error("Gagal mengambil data untuk dinilai:", err);
          setData([]);
        });
    } else {
      setData([]);
    }
  }, [selectedFormasi]); // <-- useEffect akan berjalan setiap kali filter formasi berubah


  return (
      
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Input Nilai</h1>
      <p className="text-muted-foreground mb-4">Input nilai untuk pelamar.</p>
      <div className="flex items-center gap-4 mb-4">
        <Select onValueChange={value => setSelectedFormasi(value)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Pilih Formasi" />
          </SelectTrigger>
          <SelectContent>
            {formasiList.map(f => (
              <SelectItem key={f.id} value={f.id.toString()}>
                {f.nama_formasi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(user?.role === 'verifikator' || user?.role === 'superadmin') && (
        <Button onClick={handlePrintPDFFormal}>Cetak Laporan PDF</Button>
        )}
        <Button onClick={handleSaveAll}>
          <Save className="mr-2 h-4 w-4" /> Simpan Semua Perubahan
        </Button>
      </div>

      {/* Area yang akan dicetak */}
      <div ref={componentRef} className="p-4 bg-white rounded-md border">
        {/* Judul dinamis untuk cetakan */}
        <h2 className="text-xl font-semibold mb-4 text-center">
          Daftar Nilai Peserta - {
            // PERBAIKAN 3: Menggunakan perbandingan strict (===) untuk judul
            formasiList.find(f => f.id.toString() === selectedFormasi)?.nama_formasi || ''
          }
        </h2>
        
        <Table>
          <TableHeader>
            {/* PERBAIKAN 1: Implementasi rendering header tabel */}
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* PERBAIKAN 2: Menambahkan pesan jika data kosong */}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data. Silakan pilih formasi terlebih dahulu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

// Jangan lupa salin komponen NilaiInput dari langkah sebelumnya ke file ini
}