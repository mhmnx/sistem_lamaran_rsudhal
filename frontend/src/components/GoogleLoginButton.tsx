import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // <-- 1. Impor useAuth

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

function GoogleLoginButton() {
  const { checkAuthStatus } = useAuth(); // <-- Ambil fungsi ini dari context

  const login = useGoogleLogin({
    // Hapus `flow: 'auth-code'` agar hook mengembalikan access_token
    onSuccess: async (tokenResponse) => {
      console.log("Menerima access token dari Google:", tokenResponse.access_token);
      try {
        // Kirim 'access_token' ke backend
        const response = await api.post('/auth/google/', {
          access_token: tokenResponse.access_token,
        });
        
        console.log("Respon dari backend:", response.data);
        await checkAuthStatus(); // Jangan lupa panggil ini untuk refresh status login
        
      } catch (error) {
        console.error("Gagal menukar token:", error);
      }
    },
    onError: (error) => {
      console.error('Login Google Gagal:', error);
    },
  });

  return (
    <button
      onClick={() => login()}
      className="px-4 py-2 bg-white text-black rounded hover:bg-indigo-600 hover:text-white transition-colors"
    >
      Lamar Sekarang 🚀
    </button>
  );
}

export default GoogleLoginButton;