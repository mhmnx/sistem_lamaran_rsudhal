// frontend/src/pages/LoginPage.tsx

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import GoogleLoginButton from '@/components/GoogleLoginButton';

const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api', withCredentials: true });

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword1, setRegPassword1] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const { toast } = useToast();
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/login/', { email: loginEmail, password: loginPassword });
      toast({ title: "Sukses", description: "Anda berhasil login." });
      await checkAuthStatus();
      navigate('/'); // Arahkan ke pintu gerbang
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal Login", description: "Email atau password salah." });
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (regPassword1 !== regPassword2) {
      toast({ variant: "destructive", title: "Gagal", description: "Konfirmasi password tidak cocok." });
      return;
    }
    try {
      await api.post('/auth/registration/', { email: regEmail, password: regPassword1, password2: regPassword2 });
      toast({ title: "Pendaftaran Berhasil", description: "Silakan login menggunakan akun Anda." });
      // Pindahkan user ke tab login
    } catch (error: any) {
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : "Terjadi kesalahan.";
      toast({ variant: "destructive", title: "Gagal Mendaftar", description: errorMsg });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Daftar</TabsTrigger>
        </TabsList>
        
        {/* Tab Login */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Masuk ke akun Anda untuk melanjutkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1"><Label htmlFor="login-email">Email</Label><Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required /></div>
                <div className="space-y-1"><Label htmlFor="login-password">Password</Label><Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required /></div>
                <Button type="submit" className="w-full">Login</Button>
              </form>
              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Atau lanjut dengan</span></div></div>
              <GoogleLoginButton />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Register */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Akun Baru</CardTitle>
              <CardDescription>Buat akun untuk memulai proses lamaran.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1"><Label htmlFor="reg-email">Email</Label><Input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required /></div>
                <div className="space-y-1"><Label htmlFor="reg-password">Password</Label><Input id="reg-password" type="password" value={regPassword1} onChange={(e) => setRegPassword1(e.target.value)} required /></div>
                <div className="space-y-1"><Label htmlFor="reg-password2">Konfirmasi Password</Label><Input id="reg-password2" type="password" value={regPassword2} onChange={(e) => setRegPassword2(e.target.value)} required /></div>
                <Button type="submit" className="w-full">Daftar</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}