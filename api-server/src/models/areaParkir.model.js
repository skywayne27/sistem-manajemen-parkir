const {query} = require('../config/db')

const AreaParkir = {
    getAll: () => query.all('SELECT * FROM AreaParkir ORDER BY id ASC'),

    getById: (areaId) => query.get('SELECT * FROM AreaParkir WHERE id = ?', [areaId]),

    removeById: (areaId) => query.run('DELETE FROM AreaParkir WHERE id = ?', [areaId]),

    updateById: (areaId, updatedFields) => query.run(
        `UPDATE AreaParkir SET nama = ?, lokasi = ?, kapasitasMotor = ?, kapasitasMobil = ?, tarifPerJamMotor = ?, tarifPerJamMobil = ? WHERE id = ?`, 
        [updatedFields, areaId]),

    create: (nama, lokasi, kapasitasMotor, kapasitasMobil, tarifPerJamMotor, tarifPerJamMobil) => query.run(
      `INSERT INTO AreaParkir (nama, lokasi, kapasitasMotor, kapasitasMobil, tarifPerJamMotor, tarifPerJamMobil) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [nama, lokasi, kapasitasMotor, kapasitasMobil, tarifPerJamMotor, tarifPerJamMobil]
    ),

    countActiveMobilByAreaId: (areaId) => query.get(
        `SELECT COUNT(*) as count 
        FROM TransaksiParkir t
        JOIN Kendaraan k ON t.kendaraanId = k.id
        WHERE t.areaParkirId = ? AND t.status = 'AKTIF' AND k.jenis = 'mobil'`,
        [areaId]
    ),

    countActiveMotorByAreaId: (areaId) => query.get(
        `SELECT COUNT(*) as count 
        FROM TransaksiParkir t
        JOIN Kendaraan k ON t.kendaraanId = k.id
        WHERE t.areaParkirId = ? AND t.status = 'AKTIF' AND k.jenis = 'motor'`,
        [areaId]
    ),

    countActiveTrxbyAreaId: (areaId) => query.get(
        `SELECT COUNT(*) as count FROM TransaksiParkir WHERE areaParkirId = ? AND status = 'AKTIF'`,
        [areaId]
    )
}

module.exports ={
    AreaParkir
}