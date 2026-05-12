const GAS_URL = (import.meta as any).env.VITE_GAS_API_URL;

export async function apiRequest(action: string, method: 'GET' | 'POST' = 'GET', body?: any) {
  // Cek apakah URL sudah dikonfigurasi dengan benar
  const isMock = !GAS_URL || GAS_URL === "" || GAS_URL.includes('...');
  
  if (isMock) {
    if (action === 'addTransaksi') {
      console.log(`[SIMULASI] Memproses ${body.jenis}: Rp ${body.nominal} untuk ID ${body.id_siswa}`);
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = handleMock(action, body);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      }, 500); 
    });
  }

  try {
    const options: RequestInit = {
      method: method,
    };

    let url = GAS_URL;
    if (method === 'GET') {
      const urlObj = new URL(GAS_URL);
      urlObj.searchParams.append('action', action);
      if (body) {
        Object.keys(body).forEach(key => urlObj.searchParams.append(key, body[key]));
      }
      url = urlObj.toString();
    } else {
      options.body = JSON.stringify({ action, ...body });
      // Jangan tambahkan header Content-Type agar diperlakukan sebagai simple request
      // Ini seringkali membantu menghindari masalah CORS preflight pada GAS
    }

    const res = await fetch(url, options);
    
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const text = await res.text();
    try {
      // Hilangkan karakter aneh di awal/akhir string jika ada
      const cleanText = text.trim();
      const json = JSON.parse(cleanText);
      if (json.status === 'error') throw new Error(json.message);
      return json.data;
    } catch (e: any) {
      console.error("Gagal parse JSON. Error:", e.message);
      console.error("Response mentah (200 karakter pertama):", text.substring(0, 200));
      
      if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
        throw new Error("Server mengirim HTML (Bukan JSON). Ini biasanya berarti Apps Script butuh otoritas ulang atau link Web App salah.");
      }
      
      throw new Error(`Format respons tidak valid: ${e.message}`);
    }
  } catch (error: any) {
    console.error("API Error:", error);
    if (error.message === 'Failed to fetch') {
      throw new Error("Gagal terhubung ke API. Pastikan URL Apps Script benar dan sudah di-deploy sebagai 'Anyone'.");
    }
    throw error;
  }
}

// Ambil data dari localStorage atau gunakan default jika belum ada
const getTempSiswa = () => {
  const stored = localStorage.getItem('siswa_data');
  if (stored) return JSON.parse(stored);
  return [
    { id_siswa: '1', "nomor urut": 1, nama: 'Ahmad Faisal', kelas: '7A', wali: 'Bapak Ahmad', kamar: 'Abu Bakar', saldo: 500000 },
    { id_siswa: '2', "nomor urut": 2, nama: 'Siti Aminah', kelas: '7B', wali: 'Ibu Aminah', kamar: 'Aisyah', saldo: 750000 },
    { id_siswa: '3', "nomor urut": 3, nama: 'Muhammad Ali', kelas: '8A', wali: 'Bapak Ali', kamar: 'Umar Bin Khattab', saldo: 1200000 },
  ];
};

const getTempTransactions = () => {
  const stored = localStorage.getItem('transaksi_history');
  if (stored) return JSON.parse(stored);
  return [];
};

const saveTempSiswa = (data: any[]) => {
  localStorage.setItem('siswa_data', JSON.stringify(data));
};

const saveTempTransaction = (tx: any) => {
  const history = getTempTransactions();
  history.push(tx);
  localStorage.setItem('transaksi_history', JSON.stringify(history));
};

function handleMock(action: string, body?: any) {
  let currentSiswa = getTempSiswa();
  let currentHistory = getTempTransactions();

  switch (action) {
    case 'login':
      if (body.username === 'admin' && body.password === 'admin') {
        return { id: 'admin', username: 'admin', role: 'admin', token: 'mock-token' };
      }
      throw new Error("Username atau Password salah (Coba: admin/admin)");
    case 'getDashboard':
      const totalS = currentSiswa.reduce((sum: number, s: any) => sum + (Number(s.saldo) || 0), 0);
      return {
        totalSiswa: currentSiswa.length,
        totalSaldo: totalS,
        transaksiHariIni: currentHistory.filter((t: any) => 
          t.tanggal.startsWith(new Date().toISOString().split('T')[0])
        ).length,
        recentTransactions: currentHistory.slice(-5).reverse()
      };
    case 'getSiswa':
      return currentSiswa;
    case 'upsertSiswa':
      if (!body.data.id_siswa) {
        const newS = { ...body.data, id_siswa: 'S-' + Date.now(), saldo: 0 };
        currentSiswa.push(newS);
        saveTempSiswa(currentSiswa);
        return newS;
      }
      currentSiswa = currentSiswa.map((s: any) => s.id_siswa === body.data.id_siswa ? { ...s, ...body.data } : s);
      saveTempSiswa(currentSiswa);
      return body.data;
    case 'addTransaksi':
      const studentIdx = currentSiswa.findIndex((s: any) => s.id_siswa == body.id_siswa);
      if (studentIdx === -1) throw new Error("Siswa tidak ditemukan (ID: " + body.id_siswa + ")");
      
      const nominal = Number(body.nominal);
      let saldoSkrg = Number(currentSiswa[studentIdx].saldo) || 0;
      
      if (body.jenis === 'SETORAN') {
        saldoSkrg += nominal;
      } else {
        if (saldoSkrg < nominal) throw new Error("Saldo tidak mencukupi! Saldo saat ini: Rp " + saldoSkrg);
        saldoSkrg -= nominal;
      }
      
      currentSiswa[studentIdx].saldo = saldoSkrg;
      saveTempSiswa(currentSiswa);

      const newTx = {
        id_transaksi: 'T-' + Date.now(),
        tanggal: new Date().toISOString(),
        id_siswa: body.id_siswa,
        nama: currentSiswa[studentIdx].nama,
        nominal: nominal,
        jenis: body.jenis,
        saldo_akhir: saldoSkrg,
        petugas: body.petugas || 'Admin'
      };
      
      saveTempTransaction(newTx);
      return newTx;
    case 'getTransaksi':
      return currentHistory;
    default:
      return {};
  }
}
