// frontend/src/pages/DataPelamarPage.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import type { Lamaran } from './data-pelamar/columns'; // Impor dari file columns
import { getColumns } from './data-pelamar/columns'; // <-- Ubah cara impo
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel  } from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast"; // Impor toast
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import ApplicantForm from "@/components/forms/ApplicantForm"; // <-- Impor form baru
import { useAuth } from '@/contexts/AuthContext'; // Impor useAuth


const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

export default function DataPelamarPage() {
  const [data, setData] = useState<Lamaran[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]); 
  const [filters, setFilters] = useState({ formasi: '', provinsi: '', kabupaten: '', kecamatan: '', lokasi: '' });
  const [formasiList, setFormasiList] = useState<any[]>([]);
  const { toast } = useToast(); // Inisialisasi toast
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State untuk mengontrol dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLamaran, setEditingLamaran] = useState<Lamaran | null>(null);
  const { user } = useAuth(); // Ambil data user

  const handleExport = async () => {
    // Bangun URL dengan filter yang sedang aktif
    const params = new URLSearchParams();
    if (filters.formasi) params.append('formasi', filters.formasi);
    if (filters.provinsi) params.append('provinsi', filters.provinsi); // <-- Pastikan ini ada
    if (filters.kabupaten) params.append('kabupaten', filters.kabupaten); // <-- Tambahkan ini
    if (filters.lokasi) params.append('lokasi', filters.lokasi);
    params.append('format', 'xlsx');
    
    const exportUrl = `/v1/lamaran/?${params.toString()}`;

    try {
      const response = await api.get(exportUrl, {
        responseType: 'blob', // Minta data sebagai file (blob)
      });

      // Buat URL sementara dari data blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Data_Pelamar_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Gagal mengunduh file:", error);
      alert("Gagal mengunduh file.");
    }
  };

  const handleEdit = useCallback((lamaran: Lamaran) => {
    setEditingLamaran(lamaran);
    setIsEditDialogOpen(true);
}, []);
  // Fetch data
  useEffect(() => {
    // Ambil daftar formasi untuk filter
    api.get('/formasi/').then(res => setFormasiList(res.data));

    // Ambil data lamaran dengan filter
    const params = new URLSearchParams();
    if (filters.formasi) params.append('formasi', filters.formasi);
    if (filters.provinsi) params.append('provinsi', filters.provinsi);
    if (filters.kabupaten) params.append('kabupaten', filters.kabupaten);
    if (filters.lokasi) params.append('lokasi', filters.lokasi);

    api.get(`/v1/lamaran/?${params.toString()}`)
      .then(res => setData(res.data))
      .catch(err => console.error("Gagal fetch data pelamar:", err));

  }, [filters]); // <-- Bergantung pada objek filters

  // FUNGSI UNTUK MENGHAPUS LAMARAN
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm(`Anda yakin ingin menghapus lamaran dengan ID ${id}?`)) return;

    try {
      await api.delete(`/v1/lamaran/${id}/`);
      toast({ title: "Sukses", description: "Data lamaran berhasil dihapus." });
      refreshData(); // Panggil refresh setelah berhasil
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      toast({ variant: "destructive", title: "Gagal", description: "Tidak dapat menghapus data." });
    }
}, [toast]);

const columns = useMemo(() => getColumns(handleDelete, handleEdit), [handleDelete, handleEdit]);


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });
  
  

  const handleFilterChange = (filterName: string, value: string) => {
    // Jika user memilih "Semua Formasi", set filter menjadi string kosong
    const filterValue = value === 'all' ? '' : value;
    setFilters(prev => ({...prev, [filterName]: filterValue}));
  }

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!excelFile) {
      alert("Silakan pilih file Excel terlebih dahulu.");
      return;
    }
    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const response = await api.post('/v1/pelamar/import-excel/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: "Import Berhasil", description: response.data.status });
      refreshData();
      // Anda bisa memanggil ulang fungsi fetch data di sini
    } catch (error) {
       console.error("Gagal import CSV:", error);
       toast({ variant: "destructive", title: "Gagal Import", description: "Terjadi kesalahan saat mengimpor file." });
    } finally {
      setIsImporting(false);
      // Tutup dialog secara manual jika perlu
    }
  };

  const refreshData = () => {
    // Fungsi untuk memuat ulang data tabel, bisa Anda lengkapi
    const params = new URLSearchParams();
    if (filters.formasi) params.append('formasi', filters.formasi);
    if (filters.provinsi) params.append('provinsi', filters.provinsi);
    if (filters.kabupaten) params.append('kabupaten', filters.kabupaten);
    if (filters.lokasi) params.append('lokasi', filters.lokasi);
    // ...
    api.get(`/v1/lamaran/?${params.toString()}`).then(res => setData(res.data));
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Pelamar</h1>
        {(user?.role === 'verifikator' || user?.role === 'superadmin') && (
        <div className="flex gap-2">
            {/* TOMBOL IMPORT CSV */}
            <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Import dari Excel</Button>
          </DialogTrigger>
          <Button onClick={handleExport} variant="outline">Ekspor ke Excel</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Data Pelamar dari Excel</DialogTitle>
              <DialogDescription>
                Pilih file .xlsx atau .xls untuk diunggah. Pastikan kolom sesuai dengan template hasil ekspor.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {/* UBAH 'accept' UNTUK MENERIMA FILE EXCEL */}
              <Input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={(e) => setExcelFile(e.target.files ? e.target.files[0] : null)} 
              />
            </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
                  <Button onClick={handleImport} disabled={isImporting}>
                    {isImporting ? "Mengimpor..." : "Upload & Proses"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Tambah Pelamar Manual</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Tambah Data Pelamar Baru</DialogTitle>
                </DialogHeader>
                <ApplicantForm onSuccess={() => {
                  setIsDialogOpen(false); // Tutup dialog
                  refreshData(); // Muat ulang data tabel
                }} />
              </DialogContent>
            </Dialog>
        </div>
         )}
      </div>
      {/* Dialog untuk EDIT Pelamar */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Data Pelamar</DialogTitle>
          </DialogHeader>
          <ApplicantForm 
            initialData={editingLamaran}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              refreshData();
            }} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Area Filter */}
      <div className="flex items-center gap-4 mb-4">
        <Select onValueChange={(value) => handleFilterChange('formasi', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Formasi" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="all">Semua Formasi</SelectItem>
            {formasiList.map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.nama_formasi}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('lokasi', value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Lokasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lokasi</SelectItem>
            <SelectItem value="dalam_kota">Dalam Kota</SelectItem>
            <SelectItem value="luar_kota">Luar Kota</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          placeholder="Filter Provinsi..." 
          className="max-w-xs" 
          onChange={(e) => handleFilterChange('provinsi', e.target.value)} 
        />
        <Input 
          placeholder="Filter Kabupaten/Kota..." 
          className="max-w-xs" 
          onChange={(e) => handleFilterChange('kabupaten', e.target.value)} 
        />
      </div>

      {/* Tabel Data */}
      <div className="p-4 bg-white rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
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
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}