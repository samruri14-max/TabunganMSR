import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { formatIDR, formatDate } from '../lib/utils';
import { FileText, Download, Filter, Calendar, Search, FileDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function Laporan() {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchTransaksi();
  }, []);

  async function fetchTransaksi() {
    setLoading(true);
    try {
      const res = await apiRequest('getTransaksi'); // In real app, pass date filter
      setTransaksi(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = (type: 'PDF' | 'EXCEL') => {
    alert(`Mengekspor laporan dalam format ${type}... \nFitur ini akan mengunduh file hasil rekapitulasi.`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 lg:space-y-8">
      <div className="bg-white p-6 lg:p-8 rounded-[32px] border border-neutral-100 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-neutral-800">Laporan Keuangan</h2>
            <p className="text-[10px] lg:text-sm text-neutral-400 mt-1">Rekapitulasi seluruh setoran dan penarikan siswa</p>
          </div>
          <div className="flex flex-col sm:flex-row lg:items-center gap-3">
            <div className="flex flex-1 items-center bg-neutral-50 px-4 py-3 lg:py-2 rounded-2xl border border-neutral-100">
              <Calendar className="w-4 h-4 text-neutral-400 mr-3" />
              <div className="flex flex-1 items-center justify-between lg:justify-start">
                <input 
                  type="date" 
                  className="bg-transparent border-none outline-none text-[11px] lg:text-xs font-bold text-neutral-600 w-full"
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                />
                <span className="mx-2 text-neutral-300">-</span>
                <input 
                  type="date" 
                  className="bg-transparent border-none outline-none text-[11px] lg:text-xs font-bold text-neutral-600 w-full"
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>
            <button className="bg-emerald-800 text-white px-6 py-3 rounded-2xl font-bold text-[11px] lg:text-xs flex items-center justify-center gap-2 hover:bg-emerald-900 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={() => handleExport('PDF')}
          className="bg-white p-5 lg:p-6 rounded-[28px] lg:rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-4 hover:border-red-200 transition-all group"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-50 text-red-600 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
            <FileDown className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="text-left">
            <p className="font-bold text-neutral-800 text-sm lg:text-base">Export Laporan ke PDF</p>
            <p className="text-[9px] lg:text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Siap Cetak & Arsip</p>
          </div>
        </button>
        <button 
          onClick={() => handleExport('EXCEL')}
          className="bg-white p-5 lg:p-6 rounded-[28px] lg:rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-all group"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Download className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="text-left">
            <p className="font-bold text-neutral-800 text-sm lg:text-base">Export Laporan ke Excel</p>
            <p className="text-[9px] lg:text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Olah Data Lanjutan</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
         <div className="p-6 lg:p-8 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-sm lg:text-base text-neutral-800">Riwayat Transaksi</h3>
            <span className="text-[9px] lg:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Live Data</span>
         </div>
         
         {/* Desktop Table */}
         <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ID Transaksi</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tanggal</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Nama Siswa</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Jenis</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Nominal</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {transaksi.map((t) => (
                  <tr key={t.id_transaksi} className="hover:bg-neutral-50/30 transition-colors">
                    <td className="px-8 py-5 text-[11px] font-bold text-neutral-300">#{t.id_transaksi}</td>
                    <td className="px-8 py-5 text-xs text-neutral-600 font-medium">{formatDate(t.tanggal)}</td>
                    <td className="px-8 py-5 text-sm font-bold text-neutral-800">{t.nama}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase ${
                        t.jenis === 'SETORAN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {t.jenis}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-sm font-extrabold text-right ${t.jenis === 'SETORAN' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.jenis === 'SETORAN' ? '+' : '-'}{formatIDR(t.nominal)}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-neutral-800 text-right">{formatIDR(t.saldo_akhir)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

         {/* Mobile Card List */}
         <div className="lg:hidden divide-y divide-neutral-50">
            {transaksi.map((t) => (
              <div key={t.id_transaksi} className="p-5 active:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[13px] font-bold text-neutral-800">{t.nama}</p>
                    <p className="text-[10px] text-neutral-400 font-medium">{formatDate(t.tanggal)}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                    t.jenis === 'SETORAN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {t.jenis}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[9px] text-neutral-300 font-bold uppercase tracking-widest">#{t.id_transaksi}</p>
                  <div className="text-right">
                    <p className={`text-[13px] font-black ${t.jenis === 'SETORAN' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.jenis === 'SETORAN' ? '+' : '-'}{formatIDR(t.nominal)}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-bold">Saldo: {formatIDR(t.saldo_akhir)}</p>
                  </div>
                </div>
              </div>
            ))}
         </div>

         {transaksi.length === 0 && (
            <div className="py-20 text-center opacity-30">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p className="font-bold text-xs uppercase tracking-widest">Belum ada data transaksi</p>
            </div>
         )}
      </div>
    </motion.div>
  );
}
