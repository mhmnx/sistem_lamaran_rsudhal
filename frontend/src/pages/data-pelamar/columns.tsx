// frontend/src/pages/data-pelamar/columns.tsx

import type { ColumnDef } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

// Tipe data untuk lamaran (sesuaikan jika perlu)
export type Lamaran = {
  id: number
  pelamar_profile: {
    nama_lengkap: string
    nik: string
    kabupaten: string
    pendidikan_terakhir: string // <-- Tambahkan ini
  }
  formasi: { nama_formasi: string }
  status: string
  tanggal_lamar: string;
}

export const getColumns = (
  handleDelete: (id: number) => void,
  handleEdit: (lamaran: Lamaran) => void
): ColumnDef<Lamaran>[] => [
{
  accessorKey: "pelamar_profile.nama_lengkap",
  header: ({ column }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      Nama Lengkap <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
},
{
  accessorKey: "pelamar_profile.nik",
  header: ({ column }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      NIK <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
},
// --- Kolom Provinsi Dihapus Dari Sini ---
{
  accessorKey: "pelamar_profile.kabupaten",
  header: ({ column }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      Kabupaten/Kota <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
},
// --- TAMBAHKAN KOLOM PENDIDIKAN DI SINI ---
{
  accessorKey: "pelamar_profile.pendidikan_terakhir",
  header: ({ column }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      Pendidikan <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
},
{
  accessorKey: "formasi.nama_formasi",
  header: ({ column }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      Formasi <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
},
{
  accessorKey: "status",
  header: ({ column }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      Status Berkas <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
},
{
  accessorKey: "tanggal_lamar",
  header: "Tgl Disposisi", // Judul kolom sudah benar
  cell: ({ row }) => {
    // Mengambil data dari 'tanggal_lamar' sudah benar
    const date = new Date(row.getValue("tanggal_lamar"))
    return <div className="text-center">{date.toLocaleDateString('id-ID')}</div>
  },
},
{
  id: "actions",
  cell: ({ row }) => {
    const lamaran = row.original
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(lamaran)}>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(lamaran.id)}>Hapus</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
},
]