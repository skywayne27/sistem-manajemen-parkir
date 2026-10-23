const { query } = require('../config/db');

const TransaksiParkir = {
    BASE_JOIN_QUERY: `
        SELECT 
            t.id, t.kendaraanId, t.areaParkirId, t.waktuMasuk, t.waktuKeluar, t.biaya, t.status, t.createdAt,
            k.platNomor as k_platNomor, k.jenis as k_jenis, k.pemilik as k_pemilik,
            a.nama as a_nama, a.lokasi as a_lokasi, a.tarifPerJamMotor as a_tarifPerJamMotor, a.tarifPerJamMobil as a_tarifPerJamMobil
        FROM TransaksiParkir t
        JOIN Kendaraan k ON t.kendaraanId = k.id
        JOIN AreaParkir a ON t.areaParkirId = a.id
    `,

    create: (kendaraanId, areaParkirId, time) => query.run(
      `INSERT INTO TransaksiParkir (kendaraanId, areaParkirId, waktuMasuk, status, createdAt)
       VALUES (?, ?, ?, 'AKTIF', ?)`,
      [kendaraanId, areaParkirId, time, time]
    ),

    getById: (id) => query.get('SELECT * FROM TransaksiParkir WHERE id = ?', [id]),

    getActiveByKendaraanId: (kendaraanId) => query.get(
      "SELECT * FROM TransaksiParkir WHERE kendaraanId = ? AND status = 'AKTIF'",
      [kendaraanId]
    ),

    countUsedAreaParkirByIdAndJenis: (areaParkirId, jenis) => query.get(
      `SELECT COUNT(*) as count 
       FROM TransaksiParkir t
       JOIN Kendaraan k ON t.kendaraanId = k.id
       WHERE t.areaParkirId = ? AND t.status = 'AKTIF' AND k.jenis = ?`,
      [areaParkirId, jenis]
    ),

    queryAll: (sql, params) => query.all(sql, params),

    getActiveByIdJoinKendaraanJoinAreaParkir: () => query.all(`
        ${TransaksiParkir.BASE_JOIN_QUERY} 
        WHERE t.status = 'AKTIF' ORDER BY t.id DESC    
    `),

    getByIdJoinKendaraanJoinAreaParkir: (id) => query.get(`
        ${TransaksiParkir.BASE_JOIN_QUERY} 
        WHERE t.id = ?    
    `, [id]),

    updateById: (id, waktuKeluarStr, biaya) => query.run(
      `UPDATE TransaksiParkir 
       SET waktuKeluar = ?, biaya = ?, status = 'SELESAI' 
       WHERE id = ?`,
      [waktuKeluarStr, biaya, id]
    ),

    getAllByKendaraanId: (kendaraanId) => query.all(`
        SELECT t.id, t.waktuMasuk, t.waktuKeluar, t.biaya, t.status, a.nama as a_nama
        FROM TransaksiParkir t
        JOIN AreaParkir a ON t.areaParkirId = a.id
        WHERE t.kendaraanId = ?
        ORDER BY t.id DESC
    `, [kendaraanId]),

    removeByAreaParkirId: (id) => query.run('DELETE FROM TransaksiParkir WHERE areaParkirId = ?', [id]),
    removeByKendaraanId: (id) => query.run('DELETE FROM TransaksiParkir WHERE kendaraanId = ?', [id]),
}

module.exports ={
    TransaksiParkir
}