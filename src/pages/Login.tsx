import { useState, FormEvent } from 'react';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Wallet, ShieldCheck, AtSign, KeyRound, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('login', 'POST', { username, password });
      login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login gagal, periksa kembali akun Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-teal-100/40 rounded-full blur-[80px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-800 text-white rounded-3xl shadow-2xl shadow-emerald-200 mb-6 group transition-transform hover:rotate-6">
            <Wallet className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-800">TabunganSiswa</h1>
          <p className="text-neutral-500 mt-2 font-medium">Digital Finance for Islamic Institution</p>
        </div>

        <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-neutral-100 p-8 lg:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-neutral-800">Login Administrator</h2>
            <div className="bg-emerald-50 p-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-300 group-focus-within:text-emerald-500 transition-colors">
                  <AtSign className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-transparent rounded-2xl text-neutral-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium placeholder:text-neutral-300"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-300 group-focus-within:text-emerald-500 transition-colors">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-transparent rounded-2xl text-neutral-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium placeholder:text-neutral-300"
                  placeholder="********"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-100 transition-all hover:translate-y-[-2px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk ke Sistem'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-[3px]">Secure Access Portal v4.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
