import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go to dashboard
    const isAuth = sessionStorage.getItem('freonix_admin_auth') === 'true' || 
                   localStorage.getItem('freonix_admin_auth') === 'true';
    if (isAuth) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const u = username.trim().toLowerCase();
    const p = password.trim();

    if (u === 'freonix' && p === 'Freonixx2026') {
      if (rememberMe) {
        localStorage.setItem('freonix_admin_auth', 'true');
      } else {
        sessionStorage.setItem('freonix_admin_auth', 'true');
      }
      navigate('/admin', { replace: true });
    } else {
      setError('Username atau password yang Anda masukkan salah.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#DDA15E]/18 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B5742]/12 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-md w-full animate-fade-in">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_24px_70px_rgba(93,58,41,0.12)] relative overflow-hidden">
          {/* Top specular highlight */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B5742] to-[#DDA15E] p-1 mx-auto mb-3 shadow-[0_8px_20px_rgba(139,87,66,0.25)] flex items-center justify-center text-white">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black text-[#5D3A29]">Portal Admin FREONIX</h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Pusat Pengelolaan Data & Verifikasi Pesanan
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-800 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-1.5">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-sm shadow-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-sm shadow-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-600">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#8B5742] rounded"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-[0_6px_20px_rgba(139,87,66,0.3)] hover:shadow-[0_8px_25px_rgba(139,87,66,0.45)] transition-all active:scale-98"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-200/50 text-center">
            <Link 
              to="/"
              className="text-xs text-stone-500 hover:text-[#5D3A29] font-semibold transition-colors"
            >
              ← Kembali ke Website Pelanggan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
