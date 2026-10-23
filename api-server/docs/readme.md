# Manajemen API Server

---
## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Tools**: CORS, Dotenv, Nodemon
---

### 1. Install Dependencies
```bash
cd api-server
npm install
```

### 2. Konfigurasi Environment (Opsional)
File `.env` sudah dikonfigurasi secara default:
```env
PORT=3000
DB_PATH=./database.sqlite
```

### 3. Menjalankan Server
```bash
npm run dev
```
atau
```bash
npm start
```

### 4. Menjalankan Seed Data
Untuk mereset atau mengisi kembali data awal:
```bash
npm run seed
```

---

## 🔌 Dokumentasi Endpoint
Base URL: `http://localhost:3000/api`
### 1. Area Parkir (`/api/area-parkir`)
| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/area-parkir` | Mendapatkan semua area parkir + slot tersisa |
| `GET` | `/api/area-parkir/:id` | Mendapatkan detail 1 area parkir |
| `POST` | `/api/area-parkir` | Menambahkan area parkir baru |
| `PUT` | `/api/area-parkir/:id` | Mengubah informasi area parkir |
| `DELETE` | `/api/area-parkir/:id` | Menghapus area parkir (hanya jika tanpa transaksi aktif) |

### 2. Kendaraan (`/api/kendaraan`)
| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/kendaraan` | Mendapatkan semua kendaraan (`?jenis=motor\|mobil`) |
| `GET` | `/api/kendaraan/:id` | Mendapatkan detail kendaraan berdasarkan ID |
| `GET` | `/api/kendaraan/plat/:platNomor` | Mencari kendaraan berdasarkan plat nomor |
| `POST` | `/api/kendaraan` | Mendaftarkan kendaraan baru |
| `PUT` | `/api/kendaraan/:id` | Mengubah data kendaraan |
| `DELETE` | `/api/kendaraan/:id` | Menghapus data kendaraan |

### 3. Transaksi Parkir (`/api/transaksi`)
| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/api/transaksi` | Kendaraan masuk (mulai transaksi) |
| `GET` | `/api/transaksi` | Mendapatkan semua transaksi (`?status=&areaParkirId=`) |
| `GET` | `/api/transaksi/aktif` | Mendapatkan transaksi yang sedang aktif |
| `GET` | `/api/transaksi/:id` | Mendapatkan detail 1 transaksi |
| `PUT` | `/api/transaksi/:id/keluar` | Kendaraan keluar (selesai transaksi & hitung tarif) |
| `GET` | `/api/transaksi/kendaraan/:kendaraanId` | Mendapatkan riwayat parkir kendaraan tertentu |

---

## Format Response
### Sukses:
```json
{
  "success": true,
  "data": { ... },
  "message": "Pesan informasi"
}
```

### Gagal:
```json
{
  "success": false,
  "data": null,
  "message": "Pesan error"
}
```
### HTTP Status Code yang Digunakan

| Kode | Situasi |
|---|---|
| `200 OK` | Request berhasil (GET, PUT) |
| `201 Created` | Data baru berhasil dibuat (POST) |
| `400 Bad Request` | Input tidak valid / validasi gagal |
| `404 Not Found` | Data tidak ditemukan |
| `500 Internal Server Error` | Error server |
---