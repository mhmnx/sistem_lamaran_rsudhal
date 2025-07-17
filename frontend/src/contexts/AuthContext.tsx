// frontend/src/contexts/AuthContext.tsx
import { createContext, useState, useContext, useEffect} from 'react';
import type {ReactNode } from 'react';
import axios from 'axios';

// Konfigurasi Axios
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

// Definisikan tipe data untuk user dan context
interface User {
  email: string;
  nama_lengkap: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  no_telepon: string;
  pendidikan_terakhir: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  alamat_lengkap: string;
  pas_foto_url: string | null;
  role: 'pelamar' | 'verifikator' | 'superadmin' | 'penilai_wawancara' | 'penilai_keterampilan';
  is_profile_complete: boolean;
  has_active_application: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean; // Tambahkan state loading
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // State untuk menandai proses cek auth

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/me/'); 
      if (response.status === 200) {
        setIsAuthenticated(true);
        setUser(response.data); // <-- Langsung gunakan response.data
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };
  
  // Cek status login saat aplikasi pertama kali dimuat
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};