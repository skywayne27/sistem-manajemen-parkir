

# Response format
## AREA PARKIR
- `GET` `/api/area-parkir` 
```json
{
    "success": true,
    "data": [
        {
        "id": 1,
        "nama": "Parkir Basement A",
        "lokasi": "Gedung Utama Lt. B1",
        "kapasitasMotor": 50,
        "kapasitasMobil": 20,
        "tarifPerJamMotor": 2000,
        "tarifPerJamMobil": 5000,
        "createdAt": "2026-10-23 08:07:20",
        "slotMotorTersedia": 50,
        "slotMobilTersedia": 20
        },
        ...
    ],
    "message": "Berhasil mengambil data area parkir"
}
```

---

- `GET` `/api/area-parkir/:id` 
```json
{
    "success": true,
    "data": {
        "id": 2,
        "nama": "Parkir Gedung B",
        "lokasi": "Gedung B Lt. 1 & Outdoor",
        "kapasitasMotor": 40,
        "kapasitasMobil": 15,
        "tarifPerJamMotor": 2000,
        "tarifPerJamMobil": 4000,
        "createdAt": "2026-10-23 08:07:20",
        "slotMotorTersedia": 40,
        "slotMobilTersedia": 15
    },
    "message": "Berhasil mengambil detail area parkir"
}
```

---
- `POST` `/api/area-parkir/` 
```json
{
    "success": true,
    "data": {
        "id": 4,
        "nama": "Gedung 1",
        "lokasi": "Basement 1",
        "kapasitasMotor": 100,
        "kapasitasMobil": 40,
        "tarifPerJamMotor": 2000,
        "tarifPerJamMobil": 5000,
        "createdAt": "2026-10-24 04:09:52"
    },
    "message": "Area parkir berhasil ditambahkan"
}
```
---
- `PUT` `/api/area-parkir/:id` 
```json
{
    "success": true,
    "data": {
        "id": 1,
        "nama": "Parkir Basement A",
        "lokasi": "Gedung Utama Lt. B1",
        "kapasitasMotor": 50,
        "kapasitasMobil": 20,
        "tarifPerJamMotor": 2000,
        "tarifPerJamMobil": 6000,
        "createdAt": "2026-10-23 08:07:20"
    },
    "message": "Area parkir berhasil diperbarui"
}
```
---
- `DELETE` `/api/area-parkir/:id` 
```json
{
    "success": true,
    "data": null,
    "message": "Area parkir berhasil dihapus"
}
```
---

## KENDARAAN
- `GET` `/api/kendaraan/` 
```json
{
    "success": true,
    "data": [
        {
            "id": 6,
            "platNomor": "F 8888 MNO",
            "jenis": "motor",
            "pemilik": "Eko Saputra",
            "createdAt": "2026-10-23 08:07:20"
        },
        ...
    ],
    "message": "Berhasil mengambil data kendaraan"
}
```
---
- `GET` `/api/kendaraan/plat/:platNomor` 
```json
{
    "success": true,
    "data": {
        "id": 5,
        "platNomor": "L 1357 JKL",
        "jenis": "mobil",
        "pemilik": "Dewi Lestari",
        "createdAt": "2026-10-23 08:07:20"
    },
    "message": "Kendaraan ditemukan"
}
```

---
- `GET` `/api/kendaraan/:id` 
```json
{
    "success": true,
    "data": {
        "id": 5,
        "platNomor": "L 1357 JKL",
        "jenis": "mobil",
        "pemilik": "Dewi Lestari",
        "createdAt": "2026-10-23 08:07:20"
    },
    "message": "Berhasil mengambil detail kendaraan"
}
```

---
- `POST` `/api/kendaraan/` 
```json
{
    "success": true,
    "data": {
        "id": 9,
        "platNomor": "AB 1234 CE",
        "jenis": "mobil",
        "pemilik": "Umum",
        "createdAt": "2026-10-24 04:25:51"
    },
    "message": "Kendaraan berhasil didaftarkan"
}
```
---
- `PUT` `/api/kendaraan/:id`
```json
{
    "success": true,
    "data": {
        "id": 1,
        "platNomor": "BK 123 RF",
        "jenis": "mobil",
        "pemilik": "Budi Santoso",
        "createdAt": "2026-10-23 08:07:20"
    },
    "message": "Data kendaraan berhasil diperbarui"
}
```
---
- `DELETE` `/api/kendaraan/:id` 
```json
{
    "success": true,
    "data": null,
    "message": "Kendaraan berhasil dihapus"
}
```
---

## TRANSAKSI PARKIR
- `GET` `/api/transaksi/` 
```json
{
    "success": true,
    "data": [
        {
            "id": 13,
            "kendaraanId": 9,
            "areaParkirId": 2,
            "waktuMasuk": "2026-10-24T04:36:04.637Z",
            "waktuKeluar": null,
            "biaya": null,
            "status": "AKTIF",
            "createdAt": "2026-10-24T04:36:04.637Z",
            "kendaraan": {
                "platNomor": "AB 1234 CE",
                "jenis": "mobil",
                "pemilik": "Umum"
            },
            "areaParkir": {
                "nama": "Parkir Gedung B",
                "lokasi": "Gedung B Lt. 1 & Outdoor",
                "tarifPerJamMotor": 2000,
                "tarifPerJamMobil": 4000
            }
        },
        ...
    ],
    "message": "Berhasil mengambil data transaksi"
}
```
---
- `GET` `/api/transaksi/aktif` 
```json
{
    "success": true,
    "data": [
        {
            "id": 13,
            "kendaraanId": 9,
            "areaParkirId": 2,
            "waktuMasuk": "2026-10-24T04:36:04.637Z",
            "waktuKeluar": null,
            "biaya": null,
            "status": "AKTIF",
            "createdAt": "2026-10-24T04:36:04.637Z",
            "kendaraan": {
                "platNomor": "AB 1234 CE",
                "jenis": "mobil",
                "pemilik": "Umum"
            },
            "areaParkir": {
                "nama": "Parkir Gedung B",
                "lokasi": "Gedung B Lt. 1 & Outdoor",
                "tarifPerJamMotor": 2000,
                "tarifPerJamMobil": 4000
            }
        },
        ...
    ],
    "message": "Berhasil mengambil data transaksi aktif"
}
```

---
- `GET` `/api/transaksi/kendaraan/:kendaraanId` 
```json
{
    "success": true,
    "data": [
        {
            "id": 13,
            "waktuMasuk": "2026-10-24T04:36:04.637Z",
            "waktuKeluar": null,
            "biaya": null,
            "status": "AKTIF",
            "areaParkir": {
                "nama": "Parkir Gedung B"
            }
        },
        ...
    ],
    "message": "Berhasil mengambil riwayat transaksi kendaraan"
}
```

---
- `GET` `/api/transaksi/:id` 
```json
{
    "success": true,
    "data": {
        "id": 9,
        "kendaraanId": 9,
        "areaParkirId": 2,
        "waktuMasuk": "2026-10-24T04:35:14.545Z",
        "waktuKeluar": "2026-10-24T04:35:20.609Z",
        "biaya": 4000,
        "status": "SELESAI",
        "createdAt": "2026-10-24T04:35:14.545Z",
        "kendaraan": {
            "platNomor": "AB 1234 CE",
            "jenis": "mobil",
            "pemilik": "Umum"
        },
        "areaParkir": {
            "nama": "Parkir Gedung B",
            "lokasi": "Gedung B Lt. 1 & Outdoor",
            "tarifPerJamMotor": 2000,
            "tarifPerJamMobil": 4000
        }
    },
    "message": "Berhasil mengambil detail transaksi"
}
```

---
- `POST` `/api/transaksi/` 
```json
{
    "success": true,
    "data": {
        "id": 14,
        "kendaraanId": 2,
        "areaParkirId": 2,
        "waktuMasuk": "2026-10-24T04:44:41.031Z",
        "waktuKeluar": null,
        "biaya": null,
        "status": "AKTIF",
        "createdAt": "2026-10-24T04:44:41.031Z"
    },
    "message": "Kendaraan berhasil masuk, transaksi dimulai"
}
```

---
- `PUT` `/api/transaksi/:id/keluar` 
```json
{
    "success": true,
    "data": {
        "id": 14,
        "kendaraanId": 2,
        "areaParkirId": 2,
        "waktuMasuk": "2026-10-24T04:44:41.031Z",
        "waktuKeluar": "2026-10-24T04:47:33.071Z",
        "biaya": 2000,
        "status": "SELESAI",
        "createdAt": "2026-10-24T04:44:41.031Z",
        "kendaraan": {
            "platNomor": "B 5678 DEF",
            "jenis": "motor",
            "pemilik": "Ahmad Fauzi"
        },
        "areaParkir": {
            "nama": "Parkir Gedung B",
            "tarifPerJamMotor": 2000,
            "tarifPerJamMobil": 4000
        },
        "durasiJam": 1
    },
    "message": "Kendaraan berhasil keluar. Total biaya: Rp 2.000"
}
```