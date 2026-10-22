# Dokumen Pemetaan Fitur Antar Platform
## Sistem Manajemen Parkir

---

## 1. Rincian Fitur Masing-Masing Platform

### 🌐 A. Web Client (Platform Web)
* **Target Aktor**: Admin, Manajer Operasional, Operator Kantor
* **Teknologi**: React.js, TypeScript, Vite
* **Tujuan**: Sentralisasi pengelolaan master data, monitoring performa operasional menyeluruh, dan analisis pendapatan parkir.
* **Fitur Utama**: 
  1. Dashboard dan Analitik 
  2. Manajemen Area Parkir (Lihat, tambah, ubah, dan hapus area parkir)
  3. Manajemen Kendaraan (lihat, cari, tambah, edit, dan hapus kendaraan)
  4. Monitoring Transaksi

### 📱 B. Mobile Client (Platform Mobile)
* **Target Aktor**: Pengunjung, Pengemudi Kendaraan
* **Teknologi**: (belum ditentukan)
* **Tujuan**: Memberikan akses mandiri yang cepat bagi pengemudi untuk mengecek ketersediaan parkir dan melacak riwayat transaksi parkir kendaraannya.
* **Fitur Utama**: 
  1. Informasi Area Parkir (lihat area parkir, ketersediaan slot, melihat rincian tarif per jam per area parkir) 
  2. Cek riwayat mandiri (pencarian berdasar plat, cek status parkir aktif, riwayat pembayaran & biaya)

### 🖥️ C. Desktop Client (Platform Desktop)
* **Target Aktor**: Petugas Lapangan, Operator Gerbang Parkir (Check-In / Check-Out Gate)
* **Teknologi**: (belum ditentukan)
* **Tujuan**: Operasional gerbang masuk dan keluar dengan alur kerja cepat, input plat nomor langsung, pencegahan overcapacity, dan perhitungan tarif otomatis.
* **Fitur Utama**: 
  1. Gerbang Masuk (cek plat nomor masuk, registrasi kendaraan, validasi kapasitas, pembuatan transaksi masuk)
  2. Gerbang Keluar (cari transaksi aktif, kalkulasi biaya, penyelesaian transaksi)
  3. Monitoring Gerbang (monitor slot area petugas, pantau daftar kendaraan aktif)

---

## 2. Pemetaan Konsumsi Endpoint REST API per Platform

| No | Endpoint API | Method | Deskripsi | 🌐 Web Client | 📱 Mobile Client | 🖥️ Desktop Client |
|:--:|---|:---:|---|:---:|:---:|:---:|
| 1 | `/api/area-parkir` | `GET` | List semua area & slot |  Monitoring & List Master |  Tampil Daftar Area & Slot |  Cek Kapasitas Area |
| 2 | `/api/area-parkir/:id` | `GET` | Detail spesifik area |  Detail & Form Edit Area |  Info Detail Area | — |
| 3 | `/api/area-parkir` | `POST` | Tambah area baru |  Tambah Master Area | — | — |
| 4 | `/api/area-parkir/:id` | `PUT` | Edit data area |  Perbarui Master Area | — | — |
| 5 | `/api/area-parkir/:id` | `DELETE`| Hapus area parkir |  Hapus Area | — | — |
| 6 | `/api/kendaraan` | `GET` | List & filter kendaraan |  Direktori Master Kendaraan | — | — |
| 7 | `/api/kendaraan/:id` | `GET` | Detail data kendaraan |  Form Edit Kendaraan | — | — |
| 8 | `/api/kendaraan/plat/:platNomor` | `GET` | Cari kendaraan by plat |  Pencarian Cepat |  Cek Kendaraan Sendiri |  Cek Saat Masuk & Keluar |
| 9 | `/api/kendaraan` | `POST` | Daftarkan kendaraan |  Registrasi Master Kendaraan | — |  Registrasi Instan di Gerbang |
| 10 | `/api/kendaraan/:id` | `PUT` | Edit data kendaraan |  Update Pemilik/Data | — | — |
| 11 | `/api/kendaraan/:id` | `DELETE`| Hapus kendaraan |  Hapus Data Kendaraan | — | — |
| 12 | `/api/transaksi` | `GET` | List semua riwayat transaksi |  Audit & Semua Riwayat | — | — |
| 13 | `/api/transaksi/aktif` | `GET` | List transaksi parkir aktif |  Monitor Kendaraan Aktif |  Cek Status Aktif Sendiri |  Monitor Antrean/Zona Gerbang |
| 14 | `/api/transaksi/:id` | `GET` | Detail satu transaksi |  Modal Detail Transaksi | — |  Konfirmasi & Detail Struk |
| 15 | `/api/transaksi` | `POST` | Kendaraan masuk (Check-in) | (testing, desktop belum ada) | — |  Buat Tiket Masuk |
| 16 | `/api/transaksi/:id/keluar` | `PUT` | Kendaraan keluar (Check-out)| (testing, desktop belum ada) | — |  Hitung Biaya & Selesaikan |
| 17 | `/api/transaksi/kendaraan/:id` | `GET` | Riwayat transaksi per kendaraan |  Audit Riwayat Kendaraan |  Riwayat Parkir Pribadi | — |

## 3. Roadmap Implementasi

1. **Fase UTS**:
   - Fokus utama adalah **API Server** dan **Web Client**.
2. **Fase UAS**:
   - Implementasi **Mobile Client** untuk pengunjung dan **Desktop Client** untuk operasional gerbang kasir lapangan.
