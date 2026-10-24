

# Request format
## AREA PARKIR
- `GET` `/api/area-parkir` 
- `GET` `/api/area-parkir/:id` 
- `DELETE` `/api/area-parkir/:id`
---
- `POST` `/api/area-parkir/` 
```json
{
    "nama": string,
    "lokasi": string,
    "kapasitasMotor": int,
    "kapasitasMobil": int,
    "tarifPerJamMotor": int,
    "tarifPerJamMobil": int
}
```
---
- `PUT` `/api/area-parkir/:id` 
```json
{
    "nama?": string,
    "lokasi?": string,
    "kapasitasMotor?": int,
    "kapasitasMobil?": int,
    "tarifPerJamMotor?": int,
    "tarifPerJamMobil?": int,
}
```
---

## KENDARAAN
- `GET` `/api/kendaraan/` 
- `GET` `/api/kendaraan/plat/:platNomor` 
- `GET` `/api/kendaraan/:id` 
- `DELETE` `/api/kendaraan/:id` 

---
- `POST` `/api/kendaraan/` 
```json
{
    "platNomor": string,
    "jenis": string "mobil|motor",
    "pemilik": string default "Umum",
},
```
---
- `PUT` `/api/kendaraan/:id`
```json
{
    "platNomor?": string,
    "jenis?": string "mobil|motor",
    "pemilik?": string,
},
```


## TRANSAKSI PARKIR
- `GET` `/api/transaksi/` 
- `GET` `/api/transaksi/aktif` 
- `GET` `/api/transaksi/kendaraan/:kendaraanId` 
- `GET` `/api/transaksi/:id` 
- `PUT` `/api/transaksi/:id/keluar` 

---
- `POST` `/api/transaksi/` 
```json
{
    "kendaraanId": int,
    "areaParkirId": int
}
```