// Helper format transaksi dengan relasi objek bersarang (kendaraan & areaParkir)
const formatTransactionRow = (row) => {
  return {
    id: row.id,
    kendaraanId: row.kendaraanId,
    areaParkirId: row.areaParkirId,
    waktuMasuk: row.waktuMasuk,
    waktuKeluar: row.waktuKeluar,
    biaya: row.biaya,
    status: row.status,
    createdAt: row.createdAt,
    kendaraan: {
      platNomor: row.k_platNomor,
      jenis: row.k_jenis,
      pemilik: row.k_pemilik
    },
    areaParkir: {
      nama: row.a_nama,
      lokasi: row.a_lokasi,
      tarifPerJamMotor: row.a_tarifPerJamMotor,
      tarifPerJamMobil: row.a_tarifPerJamMobil
    }
  };
};

module.exports = {
    formatTransactionRow
}