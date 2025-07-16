// frontend/src/components/layout/VerifierLayout.tsx

import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, Users, FileCheck, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/FooterVerifier';


const allMenuItems = [
  { name: 'Dashboard', path: '/verifier/dashboard', icon: LayoutDashboard, roles: ['verifikator', 'superadmin', 'penilai_wawancara', 'penilai_keterampilan'] },
  { name: 'Data Pelamar', path: '/verifier/data-pelamar', icon: Users, roles: ['verifikator', 'superadmin', 'penilai_wawancara', 'penilai_keterampilan'] },
  { name: 'Verifikasi Berkas', path: '/verifier/verifikasi-berkas', icon: FileCheck, roles: ['verifikator', 'superadmin'] },
  { name: 'Input Nilai & Cetak', path: '/verifier/input-nilai', icon: Edit, roles: ['verifikator', 'superadmin', 'penilai_wawancara', 'penilai_keterampilan'] },
];

export function VerifierLayout() {
  const { user, logout } = useAuth();

  // Filter menu berdasarkan peran user yang sedang login
  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role || ''));


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <h1 className="text-xl font-bold text-indigo-600 mb-8">MANAJEMEN LAMARAN</h1>
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <NavLink 
              to={item.path} 
              key={item.name} 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-md ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* ===== BAGIAN HEADER/NAVBAR YANG HILANG ADA DI SINI ===== */}
        <header className="bg-white border-b p-4 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {user?.email || 'Admin Kepegawaian'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-500 hover:bg-red-50 focus:text-red-500">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        {/* ======================================================= */}
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
      
    </div>
  );
}