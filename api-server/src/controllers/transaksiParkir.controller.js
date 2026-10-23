const { Kendaraan } = require("../models/kendaraan.model")
const { AreaParkir } = require("../models/areaParkir.model")
const { TransaksiParkir } = require("../models/transaksiParkir.model")
const { successResponse, errorResponse } = require('../helpers/response');

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

// POST /api/transaksi (Kendaraan Masuk)
const create = async (req, res, next) => {
  try {
    const { kendaraanId, areaParkirId } = req.body;

    if (!kendaraanId) {
      return errorResponse(res, 'kendaraanId wajib diisi', 400);
    }
    if (!areaParkirId) {
      return errorResponse(res, 'areaParkirId wajib diisi', 400);
    }

    // 1. Cek keberadaan Kendaraan
    const kendaraan = await Kendaraan.getById(kendaraanId)
    if (!kendaraan) {
      return errorResponse(res, 'Kendaraan tidak ditemukan dalam sistem', 404);
    }

    // 2. Cek keberadaan AreaParkir
    const area = await AreaParkir.getById(areaParkirId)
    if (!area) {
      return errorResponse(res, 'Area parkir tidak ditemukan', 404);
    }

    // 3. Cek apakah kendaraan sedang memiliki transaksi AKTIF
    const existingActive = await TransaksiParkir.getActiveByKendaraanId(kendaraanId)
    if (existingActive) {
      return errorResponse(res, 'Kendaraan masih memiliki transaksi aktif (belum keluar)', 400);
    }

    // 4. Cek ketersediaan slot di AreaParkir untuk jenis kendaraan
    const isMotor = kendaraan.jenis === 'motor';
    const totalCapacity = isMotor ? area.kapasitasMotor : area.kapasitasMobil;

    const currentUsed = await TransaksiParkir.countUsedAreaParkirByIdAndJenis(areaParkirId, kendaraan.jenis)

    const usedCount = currentUsed?.count || 0;
    if (usedCount >= totalCapacity) {
      return errorResponse(res, `Area parkir penuh untuk jenis kendaraan ${kendaraan.jenis}`, 400);
    }

    // 5. Buat transaksi baru
    const now = new Date().toISOString();
    const result = await TransaksiParkir.create(kendaraanId, areaParkirId, now)

    const newTx = await TransaksiParkir.getById(result.lastID)

    return successResponse(res, newTx, 'Kendaraan berhasil masuk, transaksi dimulai', 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/transaksi (filter by status & areaParkirId)
const getAll = async (req, res, next) => {
  try {
    const { status, areaParkirId } = req.query;
    let sql = TransaksiParkir.BASE_JOIN_QUERY
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('t.status = ?');
      params.push(status.toUpperCase());
    }

    if (areaParkirId) {
      conditions.push('t.areaParkirId = ?');
      params.push(areaParkirId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY t.id DESC';
    const rows = await TransaksiParkir.queryAll(sql, params)
    const data = rows.map(formatTransactionRow);

    return successResponse(res, data, 'Berhasil mengambil data transaksi');
  } catch (error) {
    next(error);
  }
};

// GET /api/transaksi/aktif
const getAktif = async (req, res, next) => {
  try {
    const rows = await TransaksiParkir.getActiveByIdJoinKendaraanJoinAreaParkir()
    const data = rows.map(formatTransactionRow);

    return successResponse(res, data, 'Berhasil mengambil data transaksi aktif');
  } catch (error) {
    next(error);
  }
};

// GET /api/transaksi/:id
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await TransaksiParkir.getByIdJoinKendaraanJoinAreaParkir(id)

    if (!row) {
      return errorResponse(res, 'Transaksi tidak ditemukan', 404);
    }

    return successResponse(res, formatTransactionRow(row), 'Berhasil mengambil detail transaksi');
  } catch (error) {
    next(error);
  }
};

// PUT /api/transaksi/:id/keluar (Checkout / Selesaikan Transaksi)
const checkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await TransaksiParkir.getByIdJoinKendaraanJoinAreaParkir(id)
    if (!row) {
      return errorResponse(res, 'Transaksi tidak ditemukan', 404);
    }

    if (row.status !== 'AKTIF') {
      return errorResponse(res, 'Transaksi ini sudah selesai', 400);
    }

    const waktuKeluar = new Date();
    const waktuMasuk = new Date(row.waktuMasuk);

    // Hitung durasi jam dengan pembulatan ke atas (minimal 1 jam)
    const diffMs = waktuKeluar.getTime() - waktuMasuk.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const durasiJam = Math.max(1, Math.ceil(diffHours));

    // Ambil tarif per jam berdasarkan jenis kendaraan
    const tarifPerJam = row.k_jenis === 'motor' ? row.a_tarifPerJamMotor : row.a_tarifPerJamMobil;
    const biaya = durasiJam * tarifPerJam;

    const waktuKeluarStr = waktuKeluar.toISOString();

    await TransaksiParkir.updateById(id, waktuKeluarStr, biaya)

    // Format mata uang untuk pesan response
    const rupiahFormatted = new Intl.NumberFormat('id-ID').format(biaya);

    const responseData = {
      id: row.id,
      kendaraanId: row.kendaraanId,
      areaParkirId: row.areaParkirId,
      waktuMasuk: row.waktuMasuk,
      waktuKeluar: waktuKeluarStr,
      biaya: biaya,
      status: 'SELESAI',
      createdAt: row.createdAt,
      kendaraan: {
        platNomor: row.k_platNomor,
        jenis: row.k_jenis,
        pemilik: row.k_pemilik
      },
      areaParkir: {
        nama: row.a_nama,
        tarifPerJamMotor: row.a_tarifPerJamMotor,
        tarifPerJamMobil: row.a_tarifPerJamMobil
      },
      durasiJam: durasiJam
    };

    return successResponse(
      res,
      responseData,
      `Kendaraan berhasil keluar. Total biaya: Rp ${rupiahFormatted}`
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/transaksi/kendaraan/:kendaraanId (Riwayat transaksi kendaraan)
const getByKendaraan = async (req, res, next) => {
  try {
    const { kendaraanId } = req.params;

    const kendaraan = await Kendaraan.getById(kendaraanId)
    if (!kendaraan) {
      return errorResponse(res, 'Kendaraan tidak ditemukan', 404);
    }

    const rows = await TransaksiParkir.getAllByKendaraanId(kendaraanId)

    const data = rows.map((r) => ({
      id: r.id,
      waktuMasuk: r.waktuMasuk,
      waktuKeluar: r.waktuKeluar,
      biaya: r.biaya,
      status: r.status,
      areaParkir: {
        nama: r.a_nama
      }
    }));

    return successResponse(res, data, 'Berhasil mengambil riwayat transaksi kendaraan');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getAktif,
  getById,
  checkout,
  getByKendaraan
};
