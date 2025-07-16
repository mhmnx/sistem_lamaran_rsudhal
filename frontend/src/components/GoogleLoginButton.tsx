import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // <-- 1. Impor useAuth

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

function GoogleLoginButton() {
  const { checkAuthStatus } = useAuth(); // <-- 2. Ambil fungsi checkAuthStatus

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await api.post('/auth/google/', {
          access_token: tokenResponse.access_token,
        });
        
        console.log("Login ke backend berhasil. Memeriksa ulang status auth...");
        
        // 3. Panggil checkAuthStatus untuk memperbarui state aplikasi
        await checkAuthStatus(); 
        
        // Anda tidak perlu alert lagi, redirect akan terjadi secara otomatis
        // alert("Login Berhasil!");

      } catch (error) {
        console.error("Gagal menukar token:", error);
        alert("Login Gagal. Cek console untuk detail.");
      }
    },
    onError: (error) => {
      console.error('Login Google Gagal:', error);
    },
  });

  return (
    <button
      onClick={() => login()}
      className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-900"
    >
      Sign in with Google 🚀
    </button>
  );
}

export default GoogleLoginButton;