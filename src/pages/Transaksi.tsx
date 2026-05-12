import { useState, useEffect, FormEvent } from 'react';
import { apiRequest } from '../lib/api';
import { formatIDR } from '../lib/utils';
import { ArrowUpCircle, ArrowDownCircle, Search, User, CreditCard, Send, Printer, FileCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Transaksi({ type }: { type: 'SETORAN' | 'PENARIKAN' }) {
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [nominal, setNominal] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    fetchSiswa();
  }, []);

  async function fetchSiswa() {
    try {
      const res = await apiRequest('getSiswa');
      setSiswaList(res);
    } catch (e) { console.error(e); }
  }

  const selectedSiswa = siswaList.find(s => String(s.id_siswa) === String(selectedSiswaId));

  async function handleTransaction(e: FormEvent) {
    e.preventDefault();
    if (!selectedSiswaId || !nominal) return;
    
    setLoading(true);
    setSuccessData(null);
    try {
      const res = await apiRequest('addTransaksi', 'POST', {
        id_siswa: String(selectedSiswaId),
        nominal: Number(nominal),
        jenis: type,
        petugas: 'Admin'
      });
      
      // Update saldo di list lokal segera untuk feedback instan di UI
      setSiswaList(prev => prev.map(s => 
        String(s.id_siswa) === String(selectedSiswaId) 
          ? { ...s, saldo: res.saldo_akhir } 
          : s
      ));

      setSuccessData(res);
      setNominal('');
      
      // Refresh data dari server setelah jeda singkat (untuk memastikan sinkronisasi dengan GAS)
      setTimeout(() => {
        fetchSiswa();
      }, 1500);
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 border border-neutral-100 shadow-sm h-full">
             <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 shadow-xl ${
               type === 'SETORAN' ? 'bg-emerald-800 text-white shadow-emerald-100' : 'bg-red-800 text-white shadow-red-100'
             }`}>
               {type === 'SETORAN' ? <ArrowUpCircle className="w-6 h-6 lg:w-8 lg:h-8" /> : <ArrowDownCircle className="w-6 h-6 lg:w-8 lg:h-8" />}
             </div>
             
             <h2 className="text-xl lg:text-2xl font-bold text-neutral-800 mb-1">Input {type === 'SETORAN' ? 'Setoran' : 'Penarikan'}</h2>
             <p className="text-xs lg:text-sm text-neutral-400 mb-8 px-0.5">Lengkapi detail transaksi di bawah ini</p>

           <form onSubmit={handleTransaction} className="space-y-8">
             <div>
               <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-1">Pilih Siswa</label>
               <div className="relative group">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-emerald-500 transition-colors" />
                 <select 
                    required
                    value={selectedSiswaId}
                    onChange={e => setSelectedSiswaId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                  >
                    <option value="">-- Cari Nama Siswa --</option>
                    {siswaList.map(s => (
                      <option key={s.id_siswa} value={s.id_siswa}>
                        {s.nama} - {s.kelas} (Saldo: {formatIDR(s.saldo || 0)})
                      </option>
                    ))}
                 </select>
               </div>
             </div>

             <div>
               <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-1">Nominal (Rp)</label>
               <div className="relative group">
                 <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-emerald-500 transition-colors" />
                 <input 
                    type="number"
                    required
                    placeholder="Contoh: 50000"
                    value={nominal}
                    onChange={e => setNominal(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-extrabold text-neutral-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-neutral-300"
                  />
               </div>
             </div>

             <button 
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:translate-y-[-2px] shadow-lg disabled:opacity-50 ${
                  type === 'SETORAN' ? 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-emerald-50' : 'bg-red-800 text-white hover:bg-red-900 shadow-red-50'
                }`}
              >
                <Send className="w-5 h-5" />
                {loading ? 'Memproses...' : `Proses ${type}`}
             </button>
           </form>
        </div>
      </motion.div>

        {/* Preview / Result Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 border border-neutral-100 shadow-sm min-h-[300px] lg:min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden h-full">
          {successData ? (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-neutral-800 mb-2">Transaksi Berhasil!</h3>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-10">Bukti Simpanan Digital</p>
                
                <div className="bg-neutral-50 rounded-3xl p-6 mb-8 text-left space-y-4 border border-neutral-100">
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No. Resi</span>
                    <span className="text-xs font-black text-neutral-800">{successData.id_transaksi}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Nominal</span>
                    <span className={`text-sm font-black ${type === 'SETORAN' ? 'text-emerald-600' : 'text-red-600'}`}>{formatIDR(successData.nominal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Saldo Akhir</span>
                    <span className="text-sm font-black text-neutral-800">{formatIDR(successData.saldo_akhir)}</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-900 transition-all">
                  <Printer className="w-4 h-4" />
                  Cetak Bukti Resi
                </button>
             </motion.div>
          ) : (
            <div className="p-8">
              {selectedSiswa ? (
                <div>
                   <h3 className="text-lg font-bold text-neutral-800 mb-8 underline decoration-emerald-200 decoration-4 underline-offset-4">Informasi Rekening Siswa</h3>
                   <div className="space-y-6">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-white shadow-xl flex items-center justify-center font-bold text-3xl text-emerald-800 mb-4 uppercase">
                          {selectedSiswa.nama?.charAt(0)}
                        </div>
                        <h4 className="font-bold text-xl text-neutral-800">{selectedSiswa.nama}</h4>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{selectedSiswa.kelas} / {selectedSiswa.kamar}</p>
                      </div>
                      <div className="bg-emerald-800 text-white rounded-3xl p-6 shadow-xl shadow-emerald-100">
                        <p className="text-[9px] font-bold uppercase tracking-[4px] opacity-60 mb-2">Saldo Saat Ini</p>
                        <p className="text-2xl font-black">{formatIDR(selectedSiswa.saldo || 0)}</p>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="opacity-20 flex flex-col items-center">
                    <Search className="w-20 h-20 mb-6" />
                    <p className="font-black text-sm uppercase tracking-[4px]">Preview Transaksi</p>
                    <p className="text-xs mt-2 font-medium">Pilih siswa untuk melihat profil & saldo</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
}
