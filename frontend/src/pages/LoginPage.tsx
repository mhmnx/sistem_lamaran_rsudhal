import GoogleLoginButton from '../components/GoogleLoginButton';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-6">
          Portal Lamaran RS
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Silakan login untuk melanjutkan
        </p>
        <GoogleLoginButton />
      </div>
    </div>
  );
}