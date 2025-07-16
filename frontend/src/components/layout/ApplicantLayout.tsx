import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import Footer from './Footer';


export function ApplicantLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex-shrink-0">
              <Link to="/pelamar/dashboard" className="text-xl font-bold text-indigo-600">
                Portal Lamaran RS
              </Link>
            </div>

            {/* Navigasi Utama */}
            <nav className="hidden md:flex md:space-x-8">
              <Link to="/pelamar/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
              <Link to="/formasi" className="text-gray-500 hover:text-gray-700">Formasi</Link>
              <Link to="/informasi" className="text-gray-500 hover:text-gray-700">Informasi</Link>
              {/* Link Profil dihapus dari sini */}
            </nav>

            {/* Menu Profil & Logout */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Link Profil ditambahkan di sini */}
                  <DropdownMenuItem asChild>
                    <Link to="/pelamar/profil">Profil Saya</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      {/* Konten Halaman */}
      <main className="flex-1">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
      </div>
        </main>

    <Footer />
    </div>
    
  );
}