const { query } = require('../src/config/db');

const initSchema = async () => {
  const schemaSql = `
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

    CREATE TABLE IF NOT EXISTS Kendaraan (
      id          INTEGER  PRIMARY KEY AUTOINCREMENT,
      platNomor   TEXT     NOT NULL UNIQUE,
      jenis       TEXT     NOT NULL CHECK(jenis IN ('motor', 'mobil')),
      pemilik     TEXT     NOT NULL DEFAULT 'Umum',
      createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS TransaksiParkir (
      id            INTEGER  PRIMARY KEY AUTOINCREMENT,
      kendaraanId   INTEGER  NOT NULL,
      areaParkirId  INTEGER  NOT NULL,
      waktuMasuk    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      waktuKeluar   DATETIME,
      biaya         INTEGER,
      status        TEXT     NOT NULL DEFAULT 'AKTIF' CHECK(status IN ('AKTIF', 'SELESAI')),
      createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (kendaraanId)  REFERENCES Kendaraan(id),
      FOREIGN KEY (areaParkirId) REFERENCES AreaParkir(id)
    );
  `;

  try {
    await query.exec(schemaSql);
    console.log('✅ Skema database berhasil diinisialisasi');
  } catch (err) {
    console.error('❌ Gagal menginisialisasi skema database:', err);
    throw err;
  }
};

if (require.main === module) {
  initSchema()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
}


