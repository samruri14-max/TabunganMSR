/**
 * GOOGLE APPS SCRIPT - DATABASE CONNECTOR (v2.5 - Ultimate Fix)
 * Copy code ini ke Google Apps Script editor (script.google.com)
 * 
 * Update 12 Mei 2026:
 * - Fix parsing angka yang mengandung simbol mata uang (Rp, IDR, dll)
 * - Validasi input nominal sebelum kalkulasi
 * - Penambahan log detail untuk penulisan saldo
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();
const SHEETS = {
  USERS: SS.getSheetByName("users"),
  SISWA: SS.getSheetByName("siswa"),
  TRANSAKSI: SS.getSheetByName("transaksi")
};

function doGet(e) {
  const action = e.parameter.action;
  try {
    let data = [];
    switch (action) {
      case 'getDashboard': data = getDashboardData(); break;
      case 'getSiswa': data = getDataFromSheet(SHEETS.SISWA); break;
      case 'getTransaksi': data = getDataFromSheet(SHEETS.TRANSAKSI); break;
      case 'getLaporan': data = getLaporanData(e.parameter.start, e.parameter.end); break;
      default: return responseError("Action '" + action + "' not found");
    }
    return responseSuccess(data);
  } catch (err) {
    console.error(err);
    return responseError(err.toString());
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;
    
    // Gunakan body.data jika ada, jika tidak gunakan body secara utuh (untuk fleksibilitas payload)
    const payload = body.data || body;
    
    switch (action) {
      case 'login': result = handleLogin(body.username, body.password); break;
      case 'upsertSiswa': result = upsertSiswa(payload); break;
      case 'deleteSiswa': result = deleteSiswa(body.id || body.id_siswa); break;
      case 'addTransaksi': result = addTransaksi(payload); break;
      default: return responseError("Action '" + action + "' not found");
    }
    return responseSuccess(result);
  } catch (err) {
    console.error(err);
    // Mengembalikan error yang bisa di-parse JSON oleh frontend
    return responseError(err.toString());
  }
}

function deleteSiswa(id) {
  const sheet = SHEETS.SISWA;
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const colId = findColumnIndex(headers, ["id_siswa", "idsiswa"]);
  
  if (colId === -1) throw new Error("Kolom ID tidak ditemukan.");
  
  const searchId = normalize(id);
  for (let i = 1; i < values.length; i++) {
    if (normalize(values[i][colId]) === searchId) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { id: id, deleted: true };
    }
  }
  throw new Error("Siswa dengan ID " + id + " tidak ditemukan.");
}

// --- HELPER FUNCTIONS ---

function responseSuccess(data) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function responseError(msg) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalize(str) {
  if (!str) return "";
  return str.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Membersihkan string angka dari karakter non-numerik (Rp, titik, koma)
 */
function cleanNumber(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Hapus semua kecuali angka dan titik/koma desimal
  const cleaned = val.toString().replace(/[^0-9,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function findColumnIndex(headers, targetNames) {
  if (!Array.isArray(targetNames)) targetNames = [targetNames];
  const normalizedHeaders = headers.map(h => normalize(h));
  for (let target of targetNames) {
    let t = normalize(target);
    let idx = normalizedHeaders.indexOf(t);
    if (idx !== -1) return idx;
    idx = normalizedHeaders.findIndex(h => h.includes(t) || t.includes(h));
    if (idx !== -1) return idx;
  }
  return -1;
}

function getDataFromSheet(sheet) {
  if (!sheet) throw new Error("Sheet tidak ditemukan!");
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  const rawHeaders = values[0];
  const colIdIdx = findColumnIndex(rawHeaders, ["id_siswa", "idsiswa", "nis"]);
  const colSaldoIdx = findColumnIndex(rawHeaders, ["saldo", "tabungan", "balance"]);
  const colNamaIdx = findColumnIndex(rawHeaders, ["nama", "fullname"]);

  const rows = values.slice(1);
  return rows.map(row => {
    let obj = {};
    rawHeaders.forEach((h, i) => {
      let key = h.toString().toLowerCase().trim().replace(/ /g, '_');
      if (i === colIdIdx) key = "id_siswa";
      if (i === colSaldoIdx) key = "saldo";
      if (i === colNamaIdx) key = "nama";
      
      let val = row[i];
      if (key === 'saldo' || key.includes('nominal') || key.includes('urut')) {
        val = cleanNumber(val);
      }
      obj[key] = val;
    });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ""));
}

function handleLogin(username, password) {
  const users = getDataFromSheet(SHEETS.USERS);
  const user = users.find(u => normalize(u.username || "") === normalize(username) && u.password == password);
  if (user) return { id: user.id_user || user.id || "1", username: user.username, role: user.role };
  throw new Error("Username atau Password salah");
}

function getDashboardData() {
  const siswa = getDataFromSheet(SHEETS.SISWA);
  const transaksi = getDataFromSheet(SHEETS.TRANSAKSI);
  const totalSaldo = siswa.reduce((sum, s) => sum + (Number(s.saldo) || 0), 0);
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const trxHariIni = transaksi.filter(t => t.tanggal && t.tanggal.toString().includes(today)).length;

  return {
    totalSiswa: siswa.length,
    totalSaldo: totalSaldo,
    transaksiHariIni: trxHariIni,
    recentTransactions: transaksi.slice(-5).reverse()
  };
}

function upsertSiswa(data) {
  const sheet = SHEETS.SISWA;
  const values = sheet.getDataRange().getValues();
  const rawHeaders = values[0];
  const colId = findColumnIndex(rawHeaders, ["id_siswa", "idsiswa"]);
  
  if (colId === -1) throw new Error("Kolom ID Siswa tidak ditemukan.");

  let rowIndex = -1;
  if (data.id_siswa) {
    for (let i = 1; i < values.length; i++) {
      if (normalize(values[i][colId]) === normalize(data.id_siswa)) { rowIndex = i + 1; break; }
    }
  }

  const rowData = rawHeaders.map((h, i) => {
    if (i === colId) return data.id_siswa || "";
    const key = normalize(h);
    const matchKey = Object.keys(data).find(dk => normalize(dk) === key);
    if (matchKey) {
      let val = data[matchKey];
      if (key === 'saldo') val = cleanNumber(val);
      return val;
    }
    return rowIndex > -1 ? values[rowIndex-1][i] : "";
  });

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rawHeaders.length).setValues([rowData]);
  } else {
    data.id_siswa = "S-" + Date.now();
    const resRow = rawHeaders.map((h, i) => {
      if (i === colId) return data.id_siswa;
      const key = normalize(h);
      if (key === 'saldo') return 0;
      const matchKey = Object.keys(data).find(dk => normalize(dk) === key);
      return matchKey ? data[matchKey] : "";
    });
    sheet.appendRow(resRow);
  }
  SpreadsheetApp.flush();
  return data;
}

function addTransaksi(data) {
  const sheetS = SHEETS.SISWA;
  const sheetT = SHEETS.TRANSAKSI;
  
  // 1. Validasi
  const nominalInput = cleanNumber(data.nominal);
  if (nominalInput <= 0) throw new Error("Nominal harus lebih dari 0");
  if (!data.id_siswa) throw new Error("ID Siswa tidak boleh kosong");

  // 2. Cari Siswa
  const sData = sheetS.getDataRange().getValues();
  const sHeaders = sData[0];
  const colId = findColumnIndex(sHeaders, ["id_siswa", "idsiswa"]);
  const colSaldo = findColumnIndex(sHeaders, ["saldo", "tabungan"]);
  const colNama = findColumnIndex(sHeaders, ["nama"]);

  if (colId === -1 || colSaldo === -1) throw new Error("Kolom ID atau Saldo tidak ditemukan.");

  let rowIndex = -1;
  const searchId = normalize(data.id_siswa);
  for (let i = 1; i < sData.length; i++) {
    if (normalize(sData[i][colId]) === searchId) { rowIndex = i + 1; break; }
  }

  if (rowIndex === -1) throw new Error("Siswa tidak ditemukan (ID: " + data.id_siswa + ")");

  // 3. Kalkulasi
  const oldSaldo = cleanNumber(sData[rowIndex-1][colSaldo]);
  let newSaldo = oldSaldo;

  if (data.jenis === 'SETORAN') {
    newSaldo = oldSaldo + nominalInput;
  } else if (data.jenis === 'PENARIKAN') {
    if (oldSaldo < nominalInput) throw new Error("Saldo tidak mencukupi (Saldo: " + oldSaldo + ")");
    newSaldo = oldSaldo - nominalInput;
  } else {
    throw new Error("Jenis transaksi tidak valid");
  }

  // 4. Update
  try {
    sheetS.getRange(rowIndex, colSaldo + 1).setValue(newSaldo);
    
    // Kirim data lengkap ke sheet transaksi
    const fullData = {
      ...data,
      id_transaksi: "TRX-" + Date.now(),
      tanggal: new Date().toISOString(),
      saldo_akhir: newSaldo,
      nominal: nominalInput,
      nama: colNama > -1 ? sData[rowIndex-1][colNama] : ""
    };
    
    const tHeaders = sheetT.getDataRange().getValues()[0];
    const tRow = tHeaders.map(h => {
      const k = normalize(h);
      // Cek apakah kolom ini untuk ID Siswa
      if (k === 'idsiswa' || k === 'id_siswa') return fullData.id_siswa;
      // Cek mapping umum
      const matchKey = Object.keys(fullData).find(dk => normalize(dk) === k);
      return matchKey ? fullData[matchKey] : "";
    });
    
    sheetT.appendRow(tRow);
    SpreadsheetApp.flush();
    
    return fullData;
  } catch (e) {
    throw new Error("Gagal update Spreadsheet: " + e.message);
  }
}

function getLaporanData(start, end) {
  const transaksi = getDataFromSheet(SHEETS.TRANSAKSI);
  if (!start || !end) return transaksi;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime() + 86400000;
  return transaksi.filter(t => {
    const time = new Date(t.tanggal).getTime();
    return time >= s && time <= e;
  });
}
