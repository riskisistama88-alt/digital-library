/**
 * Google Apps Script - Database Backend untuk Perpustakaan Digital
 * 
 * Cara Penggunaan:
 * 1. Buat Spreadsheet Google baru.
 * 2. Klik Extensions -> Apps Script (Ekstensi -> Apps Script).
 * 3. Hapus kode default, lalu salin seluruh kode ini ke editor Apps Script.
 * 4. Klik Deploy -> New Deployment (Terapkan -> Penerapan Baru).
 * 5. Pilih tipe "Web App" (Aplikasi Web).
 * 6. Setel "Execute as" ke "Me" (Saya / akun Google Anda).
 * 7. Setel "Who has access" ke "Anyone" (Siapa saja, termasuk anonim - ini penting agar frontend bisa fetch data).
 * 8. Klik Deploy, berikan otorisasi akses jika diminta.
 * 9. Salin URL Web App yang dihasilkan dan tempelkan pada menu Konfigurasi Database di panel Admin.
 */

// Konfigurasi ID Spreadsheet (Opsional)
// Jika script ini dibuat di dalam Spreadsheet (Container-bound), biarkan tetap null.
// Jika script dibuat secara mandiri (Standalone), isi dengan string ID Spreadsheet Anda.
const SPREADSHEET_ID = null;
const API_KEY = "SMKAS_PERPUS_KEY_2026";

function validateApiKey(e, isPost, postData) {
  if (!API_KEY) return true;
  let clientKey = "";
  if (isPost && postData) {
    clientKey = postData.key;
  } else if (e && e.parameter) {
    clientKey = e.parameter.key;
  }
  return clientKey === API_KEY;
}

function getDb() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Otomatis mendeteksi dan membuat sheet jika belum ada (Inisialisasi Database)
 */
function initializeDatabase() {
  const db = getDb();
  
  const sheetsInfo = {
    "Students": ["nis", "nama", "kejuruan", "tingkat", "status", "peran", "sandi", "telepon"],
    "Books": ["id", "judul", "penulis", "kategori", "tipe", "status", "cover", "ebookFile"],
    "Loans": ["kode", "nis", "nama", "kelas", "bookId", "judul", "status", "denda", "detailDenda", "batas", "tanggalMinta", "tanggalPinjam", "tanggalKembali"],
    "Logs": ["timestamp", "aktivitas", "detail"],
    "Reviews": ["id", "bookId", "nama", "rating", "ulasan", "timestamp"]
  };
  
  for (let sheetName in sheetsInfo) {
    let sheet = db.getSheetByName(sheetName);
    if (!sheet) {
      sheet = db.insertSheet(sheetName);
      sheet.appendRow(sheetsInfo[sheetName]);
      
      // Styling Header Sheet
      sheet.getRange(1, 1, 1, sheetsInfo[sheetName].length)
           .setFontWeight("bold")
           .setBackground("#001e2b")
           .setFontColor("#ffffff")
           .setHorizontalAlignment("center");
      
      // Mengisi Data Awal (Seed)
      seedData(sheetName, sheet);
    }
  }
}

/**
 * Mengisi data contoh/seed data perpustakaan
 */
function seedData(sheetName, sheet) {
  if (sheetName === "Students") {
    const data = [
      ["2401001", "Ahmad Fauzi", "PPLG", "XI", "Aktif", "Siswa", "", "081234567890"],
      ["2401002", "Budi Santoso", "PPLG", "X", "Aktif", "Siswa", "", "089876543210"],
      ["2401003", "Siti Aminah", "AKL", "XII", "Aktif", "Siswa", "", "082345678901"],
      ["2401004", "Cici Paramida", "MPLB 1", "XI", "Aktif", "Siswa", "", "085678901234"],
      ["2401005", "Dina Lestari", "MPLB 2", "XI", "Aktif", "Siswa", "", "087890123456"]
    ];
    data.forEach(row => sheet.appendRow(row));
  } else if (sheetName === "Books") {
    const data = [
      ["BK-00045", "Pemrograman Python", "Ahmad Fauzi", "Teknologi", "Fisik", "Buku Ready", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=120&h=180&q=80", ""],
      ["BK-00089", "Jaringan Komputer", "Sandhika Galih", "Teknologi", "Fisik", "Buku Ready", "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=120&h=180&q=80", ""],
      ["BK-00102", "Bumi Manusia", "Pramoedya Ananta Toer", "Fiksi", "E-Book", "Buku Ready", "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=120&h=180&q=80", "bumi_manusia_digital.pdf"],
      ["BK-00331", "Desain Grafis Lanjut", "Cici Paramida", "Umum", "Fisik", "Buku Ready", "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=120&h=180&q=80", ""],
      ["BK-00210", "Dasar Linux", "Sandhika Galih", "Teknologi", "Fisik", "Hilang", "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=120&h=180&q=80", ""]
    ];
    data.forEach(row => sheet.appendRow(row));
  } else if (sheetName === "Loans") {
    const data = [
      ["PJM-SMKAS-202606-00001", "2401001", "Ahmad Fauzi", "XI PPLG", "BK-00045", "Pemrograman Python", "menunggu", 0, "", "11 Jun 2026", "2026-06-04", "", ""],
      ["PJM-SMKAS-202606-00002", "2401002", "Budi Santoso", "X PPLG", "BK-00089", "Jaringan Komputer", "disiapkan", 0, "", "12 Jun 2026", "2026-06-05", "", ""],
      ["PJM-SMKAS-202606-00003", "2401003", "Siti Aminah", "XII AKL", "BK-00102", "Bumi Manusia", "dipinjam", 0, "", "11 Jun 2026", "2026-06-04", "2026-06-04", ""],
      ["PJM-SMKAS-202605-00080", "2401004", "Cici Paramida", "XI MPLB 1", "BK-00331", "Desain Grafis Lanjut", "terlambat", 8000, "8 Hari x Rp 1.000", "27 Mei 2026", "2026-05-20", "2026-05-20", ""],
      ["PJM-SMKAS-202605-00099", "2401005", "Dina Lestari", "XI MPLB 2", "BK-00210", "Dasar Linux", "terlambat", 65000, "Ganti Buku Hilang (Rp 55.000) + Keterlambatan (10 Hari x Rp 1.000)", "25 Mei 2026", "2026-05-18", "2026-05-18", ""]
    ];
    data.forEach(row => sheet.appendRow(row));
  } else if (sheetName === "Logs") {
    const data = [
      [new Date().toISOString(), "Penerimaan Pengembalian", "Admin menerima buku 'Dasar Linux' dari Dina Lestari."],
      [new Date().toISOString(), "Persetujuan Pinjam", "Menyetujui kode transaksi PJM-SMKAS-202606-00001."],
      [new Date().toISOString(), "Import Data Siswa", "Menambahkan siswa baru sebanyak 5 data awal."]
    ];
    data.forEach(row => sheet.appendRow(row));
  } else if (sheetName === "Reviews") {
    const data = [
      ["REV-00001", "BK-00045", "Ahmad Fauzi", 5, "Buku Python yang sangat mudah dipahami bagi pemula seperti saya!", new Date().toISOString()],
      ["REV-00002", "BK-00089", "Budi Santoso", 4, "Penjelasan konsep jaringannya sangat lengkap dan detail.", new Date().toISOString()]
    ];
    data.forEach(row => sheet.appendRow(row));
  }
}

/**
 * helper untuk membaca data sheet dan mengonversi menjadi format objek JSON
 */
function readSheetData(sheetName) {
  const db = getDb();
  let sheet = db.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  return values.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * helper untuk menyimpan data (bisa berupa INSERT atau UPDATE berdasarkan Key ID)
 */
function saveRecord(sheetName, idKey, record) {
  const db = getDb();
  let sheet = db.getSheetByName(sheetName);
  if (!sheet) return false;
  
  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idColIndex = headers.indexOf(idKey);
  if (idColIndex === -1) return false;
  
  let foundRow = -1;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues().map(r => r[0].toString());
    const searchId = record[idKey].toString();
    const index = ids.indexOf(searchId);
    if (index !== -1) {
      foundRow = index + 2; // +2 karena lewati header dan indeks array mulai dari 0
    }
  }
  
  const newRowValues = headers.map(header => record[header] !== undefined ? record[header] : "");
  
  if (foundRow !== -1) {
    // Update data baris yang sudah ada
    sheet.getRange(foundRow, 1, 1, headers.length).setValues([newRowValues]);
  } else {
    // Insert/tambahkan baris baru
    sheet.appendRow(newRowValues);
  }
  return true;
}

/**
 * helper untuk menghapus baris data
 */
function deleteRecord(sheetName, idKey, idValue) {
  const db = getDb();
  let sheet = db.getSheetByName(sheetName);
  if (!sheet) return false;
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idColIndex = headers.indexOf(idKey);
  if (idColIndex === -1) return false;
  
  const ids = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues().map(r => r[0].toString());
  const searchId = idValue.toString();
  const index = ids.indexOf(searchId);
  
  if (index !== -1) {
    sheet.deleteRow(index + 2);
    return true;
  }
  return false;
}

/**
 * Mengubah status buku pada inventaris
 */
function updateBookStatus(bookId, status) {
  const db = getDb();
  const sheet = db.getSheetByName("Books");
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idCol = headers.indexOf("id") + 1;
  const statusCol = headers.indexOf("status") + 1;
  
  const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues().map(r => r[0].toString());
  const idx = ids.indexOf(bookId.toString());
  if (idx !== -1) {
    sheet.getRange(idx + 2, statusCol).setValue(status);
  }
}

/**
 * Mencatat riwayat log aktivitas petugas
 */
function addLogEntry(aktivitas, detail) {
  const db = getDb();
  let sheet = db.getSheetByName("Logs");
  if (!sheet) return;
  
  const timestamp = new Date().toISOString();
  sheet.appendRow([timestamp, aktivitas, detail]);
}

/**
 * Mengunggah berkas PDF Base64 ke Google Drive dan mengembalikan URL publiknya
 */
function uploadPdfToDrive(base64DataUrl, fileName) {
  const parts = base64DataUrl.split(",");
  if (parts.length < 2) return "";
  
  const base64Data = parts[1];
  const decodedBytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedBytes, "application/pdf", fileName);
  
  // Membuat berkas di Google Drive
  const file = DriveApp.createFile(blob);
  
  // Setel izin agar siapa saja yang memiliki link dapat melihat
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getUrl();
}


/**
 * ROUTER: Handler GET request
 */
function doGet(e) {
  initializeDatabase();
  const action = e.parameter.action;
  let responseData = {};
  
  if (!validateApiKey(e, false)) {
    responseData = { success: false, message: "API Key tidak valid atau tidak ditemukan." };
    return ContentService.createTextOutput(JSON.stringify(responseData))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    if (action === "getAll") {
      const cleanStudents = readSheetData("Students").map(s => {
        let cleanS = { ...s };
        cleanS.sandi = ""; // Hapus sandi sebelum dikirim ke client
        return cleanS;
      });
      responseData = {
        success: true,
        students: cleanStudents,
        books: readSheetData("Books"),
        loans: readSheetData("Loans"),
        reviews: readSheetData("Reviews"),
        logs: readSheetData("Logs").reverse().slice(0, 10) // Ambil 10 log aktivitas terbaru
      };
    } else if (action === "test") {
      responseData = { success: true, message: "Koneksi ke Google Sheets berhasil terhubung!" };
    } else {
      responseData = { success: false, message: "Aksi GET tidak valid." };
    }
  } catch (err) {
    responseData = { success: false, message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(responseData))
                       .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ROUTER: Handler POST request
 */
function doPost(e) {
  initializeDatabase();
  let responseData = {};
  
  try {
    const postData = JSON.parse(e.postData.contents);
    
    if (!validateApiKey(e, true, postData)) {
      responseData = { success: false, message: "API Key tidak valid atau tidak ditemukan." };
      return ContentService.createTextOutput(JSON.stringify(responseData))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = postData.action;
    const payload = postData.payload;
    
    if (action === "loginAdmin") {
      const user = payload.user;
      const pass = payload.pass;
      
      const students = readSheetData("Students");
      const adminAccount = students.find(s => s.peran === "Pustakawan" && s.nis === user && s.sandi === pass);
      
      if ((user === "admin" && pass === "admin123") || adminAccount) {
        responseData = { success: true };
      } else {
        responseData = { success: false, message: "Username atau password salah." };
      }
    }
    else if (action === "saveStudent") {
      const success = saveRecord("Students", "nis", payload);
      responseData = { success: success };
      addLogEntry("Kelola Anggota", "Anggota " + payload.nama + " (" + payload.nis + ") disimpan/diperbarui.");
    } 
    else if (action === "deleteStudent") {
      const success = deleteRecord("Students", "nis", payload.nis);
      responseData = { success: success };
      addLogEntry("Kelola Anggota", "Anggota dengan NIS " + payload.nis + " dihapus.");
    } 
    else if (action === "bulkUpdateStudents") {
      payload.forEach(student => {
        saveRecord("Students", "nis", student);
      });
      responseData = { success: true };
      addLogEntry("Kelola Anggota", "Pembaruan massal data anggota sebanyak " + payload.length + " data.");
    }
    else if (action === "saveBook") {
      if (payload.tipe === "E-Book" && payload.ebookFile && payload.ebookFile.startsWith("data:")) {
        try {
          const fileUrl = uploadPdfToDrive(payload.ebookFile, payload.judul + " - " + payload.id + ".pdf");
          if (fileUrl) {
            payload.ebookFile = fileUrl; // Ganti data Base64 dengan URL Google Drive
          }
        } catch(err) {
          addLogEntry("System Error", "Gagal mengunggah PDF ke Google Drive: " + err.toString());
        }
      }
      const success = saveRecord("Books", "id", payload);
      responseData = { success: success };
      addLogEntry("Kelola Inventaris", "Koleksi '" + payload.judul + "' (" + payload.id + ") disimpan/diperbarui.");
    } 
    else if (action === "deleteBook") {
      const success = deleteRecord("Books", "id", payload.id);
      responseData = { success: success };
      addLogEntry("Kelola Inventaris", "Koleksi dengan ID " + payload.id + " dihapus.");
    } 
    else if (action === "saveLoan") {
      const success = saveRecord("Loans", "kode", payload);
      
      // sinkronkan status buku di inventaris
      if (payload.status === "dipinjam" || payload.status === "terlambat") {
        updateBookStatus(payload.bookId, "Sedang Dipinjam");
      } else if (payload.status === "selesai") {
        updateBookStatus(payload.bookId, "Buku Ready");
      }
      
      responseData = { success: success };
      addLogEntry("Sirkulasi", "Peminjaman " + payload.kode + " (" + payload.nama + ") status '" + payload.status + "' diperbarui.");
    }
    else if (action === "deleteLoan") {
      const success = deleteRecord("Loans", "kode", payload.kode);
      responseData = { success: success };
      addLogEntry("Sirkulasi", "Transaksi peminjaman " + payload.kode + " dihapus.");
    }
    else if (action === "bulkUpdateLoans") {
      // payload berupa array transaksi peminjaman
      payload.forEach(loan => {
        saveRecord("Loans", "kode", loan);
        if (loan.status === "dipinjam" || loan.status === "terlambat") {
          updateBookStatus(loan.bookId, "Sedang Dipinjam");
        } else if (loan.status === "selesai") {
          updateBookStatus(loan.bookId, "Buku Ready");
        }
      });
      responseData = { success: true };
      addLogEntry("Sistem Sirkulasi", "Sinkronisasi otomatis keterlambatan & denda berhasil dilakukan.");
    }
    else if (action === "saveReview") {
      const success = saveRecord("Reviews", "id", payload);
      responseData = { success: success };
      addLogEntry("Ulasan Buku", "Ulasan untuk buku ID " + payload.bookId + " ditambahkan oleh " + payload.nama + " (Rating: " + payload.rating + ").");
    }
    else if (action === "addLog") {
      addLogEntry(payload.aktivitas, payload.detail);
      responseData = { success: true };
    }
    else {
      responseData = { success: false, message: "Aksi POST tidak valid." };
    }
  } catch (err) {
    responseData = { success: false, message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(responseData))
                       .setMimeType(ContentService.MimeType.JSON);
}
