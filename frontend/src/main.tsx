// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// TAMBAHKAN BLOK KODE INI
if (!GOOGLE_CLIENT_ID) {
  throw new Error(
    "ERROR: VITE_GOOGLE_CLIENT_ID tidak ditemukan. Periksa file frontend/.env.local dan pastikan Anda sudah me-restart server."
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider> {/* <-- Tambahkan ini */}
        <App />
      </AuthProvider> {/* <-- Tambahkan ini */}
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

