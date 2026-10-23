const { query } = require("../config/db")

const Kendaraan = {
    getAll: () => query.all(`
        SELECT * FROM Kendaraan 
        ORDER BY id DESC
    `),

    getAllByJenis: (jenis) => query.all(
        `SELECT * FROM Kendaraan 
        WHERE jenis = ? 
        ORDER BY id DESC
        `,
        [jenis]
    ),

    getById: (id) => query.get('SELECT * FROM Kendaraan WHERE id = ?', [id]),

    getByPlat: (plat) => query.get(
      'SELECT * FROM Kendaraan WHERE UPPER(REPLACE(platNomor, " ", "")) = UPPER(REPLACE(?, " ", ""))',
      [plat]
    ),

    create: (plat, jenis, namaPemilik = 'Umum') => query.run(
      'INSERT INTO Kendaraan (platNomor, jenis, pemilik) VALUES (?, ?, ?)',
      [plat, jenis, namaPemilik]
    ),

    updateById: (id, updatedPlat, updatedJenis, updatedPemilik) => query.run(
      'UPDATE Kendaraan SET platNomor = ?, jenis = ?, pemilik = ? WHERE id = ?',
      [updatedPlat, updatedJenis, updatedPemilik, id]
    ),

    remove: (id) => query.run('DELETE FROM Kendaraan WHERE id = ?', [id]),

    checkDuplicateByPlatAndNotId: (plat, id) => query.get(
        'SELECT * FROM Kendaraan WHERE UPPER(platNomor) = ? AND id != ?',
        [plat, id]
      )

}

module.exports = {
  Kendaraan
};