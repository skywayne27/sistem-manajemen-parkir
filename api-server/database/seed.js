const { query } = require('../src/config/db');

const seedData = async () => {
  try {
    console.log('\n=== Menjalankan migrasi dan seeding data...');

    // Cek apakah tabel AreaParkir sudah memiliki data
    const existingArea = await query.get('SELECT COUNT(*) as count FROM AreaParkir');
    if (existingArea.count > 0) {
      console.log('ℹ️ Database sudah memiliki data, melewati seeding default.');
      return;
    }

    // Insert AreaParkir
    const areas = [
      {
        nama: 'Parkir Basement A',
        lokasi: 'Gedung Utama Lt. B1',
        kapasitasMotor: 50,
        kapasitasMobil: 20,
        tarifPerJamMotor: 2000,
        tarifPerJamMobil: 5000
      },
      {
        nama: 'Parkir Gedung B',
        lokasi: 'Gedung B Lt. 1 & Outdoor',
        kapasitasMotor: 40,
        kapasitasMobil: 15,
        tarifPerJamMotor: 2000,
        tarifPerJamMobil: 4000
      },
      {
        nama: 'Parkir VIP Lobby',
        lokasi: 'Depan Lobby Utama',
        kapasitasMotor: 10,
        kapasitasMobil: 10,
        tarifPerJamMotor: 3000,
        tarifPerJamMobil: 10000
      }
    ];

    for (const a of areas) {
      await query.run(
        `INSERT INTO AreaParkir (nama, lokasi, kapasitasMotor, kapasitasMobil, tarifPerJamMotor, tarifPerJamMobil)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [a.nama, a.lokasi, a.kapasitasMotor, a.kapasitasMobil, a.tarifPerJamMotor, a.tarifPerJamMobil]
      );
    }
    console.log(`✅ Berhasil menambahkan ${areas.length} Area Parkir`);

    // Insert Kendaraan
    const kendaraans = [
      { platNomor: 'B 1234 ABC', jenis: 'mobil', pemilik: 'Budi Santoso' },
      { platNomor: 'B 5678 DEF', jenis: 'motor', pemilik: 'Ahmad Fauzi' },
      { platNomor: 'D 9999 XYZ', jenis: 'mobil', pemilik: 'Siti Rahma' },
      { platNomor: 'B 2468 GHI', jenis: 'motor', pemilik: 'Rian Pratama' },
      { platNomor: 'L 1357 JKL', jenis: 'mobil', pemilik: 'Dewi Lestari' },
      { platNomor: 'F 8888 MNO', jenis: 'motor', pemilik: 'Eko Saputra' }
    ];

    for (const k of kendaraans) {
      await query.run(
        `INSERT INTO Kendaraan (platNomor, jenis, pemilik) VALUES (?, ?, ?)`,
        [k.platNomor, k.jenis, k.pemilik]
      );
    }
    console.log(`✅ Berhasil menambahkan ${kendaraans.length} Kendaraan`);

    // Insert Contoh Transaksi
    // Transaksi 1: Selesai
    await query.run(
      `INSERT INTO TransaksiParkir (kendaraanId, areaParkirId, waktuMasuk, waktuKeluar, biaya, status)
       VALUES (?, ?, datetime('now', '-3 hours'), datetime('now', '-1 hours'), ?, ?)`,
      [1, 1, 10000, 'SELESAI']
    );

    // Transaksi 2: Selesai
    await query.run(
      `INSERT INTO TransaksiParkir (kendaraanId, areaParkirId, waktuMasuk, waktuKeluar, biaya, status)
       VALUES (?, ?, datetime('now', '-5 hours'), datetime('now', '-2 hours'), ?, ?)`,
      [2, 1, 6000, 'SELESAI']
    );

    // Transaksi 3: AKTIF (Mobil di Basement A)
    await query.run(
      `INSERT INTO TransaksiParkir (kendaraanId, areaParkirId, waktuMasuk, waktuKeluar, biaya, status)
       VALUES (?, ?, datetime('now', '-45 minutes'), NULL, NULL, 'AKTIF')`,
      [3, 1]
    );

    // Transaksi 4: AKTIF (Motor di Basement A)
    await query.run(
      `INSERT INTO TransaksiParkir (kendaraanId, areaParkirId, waktuMasuk, waktuKeluar, biaya, status)
       VALUES (?, ?, datetime('now', '-120 minutes'), NULL, NULL, 'AKTIF')`,
      [4, 1]
    );

    console.log('✅ Berhasil menambahkan contoh Transaksi Parkir');
    console.log('🎉 Seeding selesai dengan sukses!');
  } catch (err) {
    console.error('❌ Gagal menjalankan seed:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData().then(() => process.exit(0));
}


