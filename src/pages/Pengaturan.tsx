import { useState, FormEvent } from 'react';
import { useAuthStore } from '../lib/store';
import { Settings, School, Lock, Save, RefreshCw, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function Pengaturan() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [profil, setProfil] = useState({
    nama: 'Pondok Pesantren Al-Iman',
    alamat: 'Jl. Pendidikan No. 123, Indonesia',
    telp: '0812-3456-7890',
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Pengaturan profil sekolah berhasil disimpan!");
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 lg:p-10 rounded-[32px] lg:rounded-[40px] border border-neutral-100 shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <School className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Profil Sekolah</h2>
            <p className="text-sm text-neutral-400 mt-1">Informasi instansi yang muncul di struk & laporan</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-1">Nama Instansi</label>
              <input 
                className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={profil.nama}
                onChange={e => setProfil({...profil, nama: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-1">Nomor Telepon</label>
              <input 
                className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={profil.telp}
                onChange={e => setProfil({...profil, telp: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-1">Alamat Lengkap</label>
              <textarea 
                rows={3}
                className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                value={profil.alamat}
                onChange={e => setProfil({...profil, alamat: e.target.value})}
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
           </div>
           <h3 className="text-xl font-bold text-neutral-800 mb-2">Ganti Password</h3>
           <p className="text-xs text-neutral-400 font-medium mb-6">Perbarui keamanan akun administrator Anda</p>
           <button className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all">
              Ubah Password Sekarang
           </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Database className="w-6 h-6" />
           </div>
           <h3 className="text-xl font-bold text-neutral-800 mb-2">Sinkronisasi Database</h3>
           <p className="text-xs text-neutral-400 font-medium mb-6">Paksa pembaruan data dari Google Spreadsheet</p>
           <button className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
              Tarik Data (Fetch All)
           </button>
        </div>
      </div>
    </motion.div>
  );
}
