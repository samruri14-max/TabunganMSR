import { useState, useEffect, FormEvent } from 'react';
import { apiRequest } from '../lib/api';
import { formatIDR } from '../lib/utils';
import { Plus, Search, Filter, MoreHorizontal, UserPlus, GraduationCap, Bed, Coins, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Siswa() {
  const [siswa, setSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSiswa, setCurrentSiswa] = useState<any>(null);

  useEffect(() => {
    fetchSiswa();
  }, []);

  async function fetchSiswa() {
    setLoading(true);
    try {
      const res = await apiRequest('getSiswa');
      setSiswa(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredSiswa = siswa.filter(s => 
    s.nama?.toLowerCase().includes(search.toLowerCase()) || 
    s.kelas?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    if (!currentSiswa) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa ${currentSiswa.nama}?`)) return;
    
    setLoading(true);
    try {
      await apiRequest('deleteSiswa', 'POST', { id: currentSiswa.id_siswa });
      setIsModalOpen(false);
      fetchSiswa();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      // Pastikan nominal urut adalah angka
      const payload = {
        ...data,
        "nomor urut": Number(data["nomor urut"]),
        id_siswa: currentSiswa?.id_siswa || null,
        saldo: Number(currentSiswa?.saldo || 0)
      };

      await apiRequest('upsertSiswa', 'POST', { data: payload });
      setIsModalOpen(false);
      fetchSiswa();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 bg-white p-6 lg:p-8 rounded-[32px] border border-neutral-100 shadow-sm">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-neutral-800">Data Siswa</h2>
          <p className="text-[10px] lg:text-sm text-neutral-400 mt-1">Total {siswa.length} siswa terdaftar di sistem</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group flex-1 sm:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari nama atau kelas..."
              className="pl-12 pr-6 py-2.5 lg:py-3 bg-neutral-50 border-none rounded-2xl text-[13px] lg:text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none w-full lg:w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setCurrentSiswa(null); setIsModalOpen(true); }}
            className="bg-emerald-800 text-white py-2.5 px-6 rounded-2xl font-bold text-[13px] lg:text-sm flex items-center justify-center gap-2 hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-100"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Table Area - Desktop only */}
      <div className="hidden lg:block bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-8 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">ID / No</th>
                <th className="px-8 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Nama Lengkap</th>
                <th className="px-8 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest text-center">Kelas</th>
                <th className="px-8 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Wali / Kamar</th>
                <th className="px-8 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest text-right">Saldo Tabungan</th>
                <th className="px-8 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredSiswa.map((s) => (
                <tr key={s.id_siswa} className="hover:bg-neutral-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-neutral-300">{s.id_siswa}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        {s.nama?.charAt(0)}
                      </div>
                      <p className="text-sm font-bold text-neutral-800">{s.nama}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-cyan-50 text-cyan-600 text-[10px] font-bold px-3 py-1 rounded-lg border border-cyan-100">
                      Kelas {s.kelas}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-neutral-700">{s.wali}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                      <Bed className="w-3 h-3" />
                      {s.kamar}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-sm font-extrabold text-emerald-600">{formatIDR(s.saldo || 0)}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => { setCurrentSiswa(s); setIsModalOpen(true); }}
                      className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSiswa.length === 0 && !loading && (
            <div className="py-20 text-center">
              <p className="text-sm text-neutral-400">Tidak ada data siswa</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Area - Mobile only */}
      <div className="lg:hidden space-y-4">
        {filteredSiswa.map((s) => (
          <div 
            key={s.id_siswa} 
            onClick={() => { setCurrentSiswa(s); setIsModalOpen(true); }}
            className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  {s.nama?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800">{s.nama}</p>
                  <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{s.id_siswa}</p>
                </div>
              </div>
              <span className="bg-cyan-50 text-cyan-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-cyan-100">
                {s.kelas}
              </span>
            </div>
            
            <div className="flex items-center justify-between border-t border-neutral-50 pt-4">
              <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider space-y-1">
                <p className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3 text-emerald-500" /> {s.wali}</p>
                <p className="flex items-center gap-1.5"><Bed className="w-3 h-3 text-emerald-500" /> {s.kamar}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">Saldo</p>
                <p className="text-sm font-extrabold text-emerald-600">{formatIDR(s.saldo || 0)}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredSiswa.length === 0 && !loading && (
          <div className="bg-white rounded-3xl py-12 text-center border border-dashed border-neutral-200">
            <p className="text-sm text-neutral-400">Tidak ada data siswa</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6 bg-neutral-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[40px] lg:rounded-[40px] w-full max-w-xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-8 lg:p-10 max-h-[90vh] lg:max-h-none overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800">{currentSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Lengkapi biodata siswa di bawah ini</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                    <input name="nama" defaultValue={currentSiswa?.nama} required className="w-full px-5 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Masukkan nama..." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Kelas</label>
                    <input name="kelas" defaultValue={currentSiswa?.kelas} required className="w-full px-5 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="7A, 8B, dsb" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Nomor Urut</label>
                    <input name="nomor urut" type="number" defaultValue={currentSiswa?.['nomor urut']} required className="w-full px-5 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="1, 2, 3..." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Nama Wali</label>
                    <input name="wali" defaultValue={currentSiswa?.wali} required className="w-full px-5 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Bapak/Ibu..." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Kamar/Asrama</label>
                    <input name="kamar" defaultValue={currentSiswa?.kamar} required className="w-full px-5 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nama Kamar..." />
                  </div>

                  <div className="col-span-2 flex gap-3 mt-6">
                    {currentSiswa && (
                      <button 
                        type="button" 
                        onClick={handleDelete}
                        disabled={loading}
                        className="p-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all disabled:opacity-50"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-neutral-100 text-neutral-600 font-bold rounded-2xl hover:bg-neutral-200 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-[2] py-4 bg-emerald-800 text-white font-bold rounded-2xl hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                    >
                      {loading ? 'Menyimpan...' : (currentSiswa ? 'Simpan Perubahan' : 'Daftarkan Siswa')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
