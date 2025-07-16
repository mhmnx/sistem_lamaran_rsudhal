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
  nama_lengkap: string;
  email: string;
  role: 'pelamar' | 'verifikator' | 'superadmin';
  is_profile_complete: boolean;
  has_active_application: boolean;// <-- Tambahkan ini
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

// Buat Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Buat Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuthStatus = async () => {
    try {
      // Endpoint /api/me/ yang akan kita buat ulang
      const response = await api.get('/me/'); 
      if (response.status === 200) {
        setIsAuthenticated(true);
        setUser(response.data);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
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
    <AuthContext.Provider value={{ isAuthenticated, user, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Buat custom hook untuk menggunakan context dengan mudah
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};