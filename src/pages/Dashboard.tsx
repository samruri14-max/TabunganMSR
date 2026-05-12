import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { formatIDR, formatDate } from '../lib/utils';
import StatCard from '../components/StatCard';
import { Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Sen', m: 4000, t: 2400 },
  { name: 'Sel', m: 3000, t: 1398 },
  { name: 'Rab', m: 2000, t: 9800 },
  { name: 'Kam', m: 2780, t: 3908 },
  { name: 'Jum', m: 1890, t: 4800 },
  { name: 'Sab', m: 2390, t: 3800 },
  { name: 'Min', m: 3490, t: 4300 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await apiRequest('getDashboard');
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <RefreshCcw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-neutral-400 font-medium animate-pulse">Memuat data Dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard 
          label="Total Siswa" 
          value={stats?.totalSiswa || 0} 
          icon={Users} 
          color="bg-emerald-600" 
          trend="+12%"
        />
        <StatCard 
          label="Total Saldo" 
          value={formatIDR(stats?.totalSaldo || 0)} 
          icon={CreditCard} 
          color="bg-teal-600" 
          trend="+5.4%"
        />
        <StatCard 
          label="Transaksi Hari Ini" 
          value={stats?.transaksiHariIni || 0} 
          icon={Activity} 
          color="bg-cyan-600" 
        />
        <StatCard 
          label="Trend Bulanan" 
          value="Stabil" 
          icon={Activity} 
          color="bg-indigo-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-5 lg:p-8 border border-neutral-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-neutral-800">Visualisasi Transaksi</h3>
              <p className="text-[10px] lg:text-xs text-neutral-400 mt-1">Laporan grafik mingguan setoran & penarikan</p>
            </div>
            <select className="bg-neutral-50 border-none text-[10px] lg:text-xs font-semibold rounded-lg px-3 py-2 outline-none w-fit">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          
          <div className="h-[200px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="m" stroke="#10b981" fillOpacity={1} fill="url(#colorM)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-neutral-100 shadow-sm">
          <h3 className="text-lg lg:text-xl font-bold text-neutral-800 mb-6">Aktivitas Terbaru</h3>
          <div className="space-y-6">
            {stats?.recentTransactions?.map((tx: any) => (
              <div key={tx.id_transaksi} className="flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  tx.jenis === 'SETORAN' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {tx.jenis === 'SETORAN' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-neutral-800 truncate">{tx.nama}</p>
                  <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{formatDate(tx.tanggal)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.jenis === 'SETORAN' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.jenis === 'SETORAN' ? '+' : '-'}{formatIDR(tx.nominal)}
                  </p>
                  <span className="text-[9px] font-semibold text-neutral-300 uppercase">Success</span>
                </div>
              </div>
            ))}
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
              <div className="text-center py-12">
                <p className="text-sm text-neutral-400 italic">Belum ada transaksi hari ini</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl transition-all border border-emerald-100">
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>
    </motion.div>
  );
}
