# Data Model
## Sistem Manajemen Parkir
---

## 1. Definisi Tabel

### Tabel: `AreaParkir`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identitas unik area |
| `nama` | TEXT | NOT NULL | Nama area (mis: "Parkir A", "Gedung B") |
| `lokasi` | TEXT | NOT NULL | Deskripsi lokasi fisik |
| `kapasitasMotor` | INTEGER | NOT NULL, DEFAULT 0 | Maks slot untuk motor |
| `kapasitasMobil` | INTEGER | NOT NULL, DEFAULT 0 | Maks slot untuk mobil |
| `tarifPerJamMotor` | INTEGER | NOT NULL | Tarif motor dalam rupiah/jam |
| `tarifPerJamMobil` | INTEGER | NOT NULL | Tarif mobil dalam rupiah/jam |
| `createdAt` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Waktu data dibuat |

**Contoh Data:**
```json
{
  "id": 1,
  "nama": "Parkir Basement A",
  "lokasi": "Gedung Utama Lt. B1",
  "kapasitasMotor": 50,
  "kapasitasMobil": 20,
  "tarifPerJamMotor": 2000,
  "tarifPerJamMobil": 5000,
  "createdAt": "2026-10-21T08:00:00.000Z"
}
```

---

### Tabel: `Kendaraan`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identitas unik kendaraan |
| `platNomor` | TEXT | NOT NULL, UNIQUE | Plat nomor kendaraan (mis: "B 1234 ABC") |
| `jenis` | TEXT | NOT NULL | Enum: `motor` atau `mobil` |
| `pemilik` | TEXT | NOT NULL, DEFAULT 'Umum' | Nama pemilik/pengemudi |
| `createdAt` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Waktu data dibuat |

**Contoh Data:**
```json
{
  "id": 1,
  "platNomor": "B 1234 ABC",
  "jenis": "mobil",
  "pemilik": "Budi Santoso",
  "createdAt": "2026-10-21T09:00:00.000Z"
}
```

---

### Tabel: `TransaksiParkir`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identitas unik transaksi |
| `kendaraanId` | INTEGER | NOT NULL, FK → Kendaraan.id | Referensi kendaraan |
| `areaParkitId` | INTEGER | NOT NULL, FK → AreaParkir.id | Referensi area |
| `waktuMasuk` | DATETIME | NOT NULL | Waktu kendaraan masuk |
| `waktuKeluar` | DATETIME | NULL | Waktu keluar (null jika masih parkir) |
| `biaya` | INTEGER | NULL | Total biaya (null jika masih parkir) |
| `status` | TEXT | NOT NULL, DEFAULT 'AKTIF' | Enum: `AKTIF` atau `SELESAI` |
| `createdAt` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Waktu record dibuat |

**Contoh Data (sedang parkir):**
```json
{
  "id": 1,
  "kendaraanId": 1,
  "areaParkitId": 1,
  "waktuMasuk": "2026-10-21T10:00:00.000Z",
  "waktuKeluar": null,
  "biaya": null,
  "status": "AKTIF",
  "createdAt": "2026-10-21T10:00:00.000Z"
}
```

**Contoh Data (sudah selesai):**
```json
{
  "id": 2,
  "kendaraanId": 2,
  "areaParkitId": 1,
  "waktuMasuk": "2026-10-21T08:00:00.000Z",
  "waktuKeluar": "2026-10-21T10:30:00.000Z",
  "biaya": 15000,
  "status": "SELESAI",
  "createdAt": "2026-10-21T08:00:00.000Z"
}
```


## 2. SQL Schema (untuk implementasi)

```sql
-- Buat tabel AreaParkir
CREATE TABLE IF NOT EXISTS AreaParkir (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nama              TEXT    NOT NULL,
  lokasi            TEXT    NOT NULL,
  kapasitasMotor    INTEGER NOT NULL DEFAULT 0,
  kapasitasMobil    INTEGER NOT NULL DEFAULT 0,
  tarifPerJamMotor  INTEGER NOT NULL DEFAULT 2000,
  tarifPerJamMobil  INTEGER NOT NULL DEFAULT 5000,
  createdAt         DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel Kendaraan
CREATE TABLE IF NOT EXISTS Kendaraan (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  platNomor   TEXT     NOT NULL UNIQUE,
  jenis       TEXT     NOT NULL CHECK(jenis IN ('motor', 'mobil')),
  pemilik     TEXT     NOT NULL DEFAULT 'Umum',
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel TransaksiParkir
CREATE TABLE IF NOT EXISTS TransaksiParkir (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  kendaraanId   INTEGER  NOT NULL,
  areaParkitId  INTEGER  NOT NULL,
  waktuMasuk    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  waktuKeluar   DATETIME,
  biaya         INTEGER,
  status        TEXT     NOT NULL DEFAULT 'AKTIF' CHECK(status IN ('AKTIF', 'SELESAI')),
  createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kendaraanId)  REFERENCES Kendaraan(id),
  FOREIGN KEY (areaParkitId) REFERENCES AreaParkir(id)
);
```

---