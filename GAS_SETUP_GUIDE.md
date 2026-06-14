# Panduan Penyiapan Database Google Apps Script (GAS)

Dokumen ini berisi panduan untuk membuat database menggunakan **Google Sheets** dan menghubungkannya dengan **Panel Admin Perpustakaan** Anda melalui **Google Apps Script**.

---

## Langkah 1: Siapkan Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com/) dan buat lembar kerja (spreadsheet) baru.
2. Anda bisa memberi nama spreadsheet tersebut, misalnya: `Database Perpustakaan SMK As-Syafi'iyah`.
3. Biarkan isi spreadsheet tetap kosong. Script backend akan otomatis membuat tabel/sheet dan data contoh (seed data) saat dijalankan pertama kali.

---

## Langkah 2: Memasang Google Apps Script
1. Pada menu Spreadsheet Anda, klik **Extensions** (Ekstensi) -> **Apps Script**.
2. Anda akan diarahkan ke jendela editor Google Apps Script.
3. Hapus seluruh kode bawaan (`function myFunction() { ... }`) yang ada di editor.
4. Buka file [database_gas.js](file:///d:/laragon/www/digital_library/database_gas.js) di folder proyek ini, salin seluruh isi kodenya, lalu tempelkan ke editor Apps Script.
5. Simpan proyek script tersebut dengan mengeklik ikon disket atau tekan tombol `Ctrl + S`. Anda bisa menamai proyek script ini, misalnya `Backend Perpus`.

---

## Langkah 3: Deploy Script sebagai Web App (Aplikasi Web)
1. Di pojok kanan atas jendela Apps Script, klik tombol **Deploy** (Terapkan) -> **New deployment** (Penerapan baru).
2. Di jendela pop-up yang muncul:
   - Klik ikon gerigi (Select type) di sebelah "Deployments", pilih **Web app** (Aplikasi web).
   - Isi **Description** sesuka Anda (misalnya: `v1.0`).
   - Pada kolom **Execute as**, pilih **Me (akun_email_anda@gmail.com)**.
   - Pada kolom **Who has access**, pilih **Anyone** (Penting: harus disetel ke "Anyone" agar panel admin Anda bisa mengirimkan data tanpa login Google).
3. Klik tombol **Deploy** (Terapkan).
4. Google akan meminta otorisasi akses (karena script mengakses Spreadsheet Anda):
   - Klik **Authorize access** (Berikan Otorisasi).
   - Pilih akun Google Anda.
   - Klik **Advanced** (Lanjutan) di kiri bawah, lalu klik **Go to Backend Perpus (unsafe)** atau **Buka Backend Perpus (tidak aman)**.
   - Klik **Allow** (Izinkan).
5. Setelah selesai, Anda akan mendapatkan informasi penerapan baru. Salin **Web app URL** yang diberikan (URL ini berformat: `https://script.google.com/macros/s/.../exec`).

---

## Langkah 4: Hubungkan ke Panel Admin Perpustakaan
1. Buka halaman panel admin perpustakaan Anda ([admin.html](file:///d:/laragon/www/digital_library/admin.html)).
2. Klik tombol **Status Database: Terhubung/Demo** di bagian kanan atas atau tombol berikon roda gigi untuk membuka pengaturan konfigurasi database.
3. Tempelkan URL Web App yang telah Anda salin sebelumnya ke dalam kolom **URL Google Apps Script API**.
4. Klik **Tes Koneksi**.
5. Jika berhasil, sistem akan memuat data awal dari Google Sheet secara otomatis! Anda sekarang dapat melakukan penambahan anggota, buku, dan transaksi sirkulasi peminjaman secara langsung dan tersinkronisasi ke Google Sheet Anda.
