// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
// Impor komponen layout dan pelindung
// Impor layout dan pelindung
import { VerifierLayout } from './components/layout/VerifierLayout';
import VerifierProtectedRoute from './components/auth/VerifierProtectedRoute';
import { ApplicantLayout } from './components/layout/ApplicantLayout';
import { Toaster } from "@/components/ui/toaster" // <-- 1. Impor Toaster
// Impor semua halaman
import FormasiPage from './pages/FormasiPage';
import ApplyPage from './pages/ApplyPage';
import VerifierDashboardPage from './pages/VerifierDashboardPage';
import DataPelamarPage from './pages/DataPelamarPage';
import InputNilaiPage from './pages/InputNilaiPage';
import ApplicantProtectedRoute from './components/auth/ApplicantProtectedRoute';
import ApplicantStatsDashboardPage from './pages/ApplicantStatsDashboardPage';
import ApplicantProfilePage from './pages/ApplicantProfilePage';
import InformationPage from './pages/InformationPage';
import VerifikasiBerkasPage from './pages/VerifikasiBerkasPage'; // <-- Impor halaman baru
import VerifierLamaranDetailPage from './pages/VerifierLamaranDetailPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Rute Publik & Pintu Gerbang */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/" element={<LandingPage />} />
        
        {/* --- STRUKTUR BARU UNTUK PELAMAR --- */}
        <Route element={isAuthenticated ? <ApplicantLayout /> : <Navigate to="/login" />}>
          {/* Rute yang tidak perlu cek kelengkapan profil (halaman profil itu sendiri) */}
          <Route path="/pelamar/profil" element={<ApplicantProfilePage />} />

          {/* Grup rute yang perlu profil lengkap */}
          <Route element={<ApplicantProtectedRoute />}>
            <Route path="/pelamar/dashboard" element={<ApplicantStatsDashboardPage />} />
            <Route path="/formasi" element={<FormasiPage />} />
            <Route path="/lamar/:formasiId" element={<ApplyPage />} />
            <Route path="/informasi" element={<InformationPage />} />
          </Route>
        </Route>
        
        {/* --- STRUKTUR UNTUK VERIFIKATOR --- */}
        {/* Pertama, lindungi grup rute */}
        <Route element={<VerifierProtectedRoute />}>
          {/* Kedua, bungkus dengan layout */}
          <Route element={<VerifierLayout />}>
            <Route path="/verifier/dashboard" element={<VerifierDashboardPage />} />
            <Route path="/verifier/data-pelamar" element={<DataPelamarPage />} />
            <Route path="/verifier/input-nilai" element={<InputNilaiPage />} />
            <Route path="/verifier/verifikasi-berkas" element={<VerifikasiBerkasPage />} />
            <Route path="/verifier/lamaran/:lamaranId" element={<VerifierLamaranDetailPage />} />
          
          </Route>
        </Route>
        {/* Redirect semua rute lain yang tidak cocok */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster /> {/* <-- 2. Tambahkan Toaster di sini */}
    </Router>
    
  );
}

export default App;