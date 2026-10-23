const { query } = require('../config/db');
const { Kendaraan } = require('../models/kendaraan.model')
const { TransaksiParkir } = require('../models/transaksiParkir.model')
const { successResponse, errorResponse } = require('../helpers/response');

// GET /api/kendaraan (mendukung filter query ?jenis=motor|mobil)
const getAll = async (req, res, next) => {
  try {
    const { jenis } = req.query;
    let data = null

    if (jenis) {
      if (jenis !== 'motor' && jenis !== 'mobil') {
        return errorResponse(res, "Parameter jenis harus 'motor' atau 'mobil'", 400);
      }
      data = await Kendaraan.getAllByJenis(jenis)
    }else{
        data = await Kendaraan.getAll()
    }

    return successResponse(res, data, 'Berhasil mengambil data kendaraan');
  } catch (error) {
    next(error);
  }
};

// GET /api/kendaraan/:id
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const kendaraan = await Kendaraan.getById(id);

    if (!kendaraan) {
      return errorResponse(res, 'Kendaraan tidak ditemukan', 404);
    }

    return successResponse(res, kendaraan, 'Berhasil mengambil detail kendaraan');
  } catch (error) {
    next(error);
  }
};

// GET /api/kendaraan/plat/:platNomor
const getByPlat = async (req, res, next) => {
  try {
    const { platNomor } = req.params;
    const cleanPlat = decodeURIComponent(platNomor).trim();

    const kendaraan = await Kendaraan.getByPlat(cleanPlat);

    if (!kendaraan) {
      return errorResponse(res, 'Kendaraan dengan plat nomor tersebut tidak ditemukan', 404);
    }

    return successResponse(res, kendaraan, 'Kendaraan ditemukan');
  } catch (error) {
    next(error);
  }
};

// POST /api/kendaraan
const create = async (req, res, next) => {
  try {
    const { platNomor, jenis, pemilik } = req.body;

    if (!platNomor || typeof platNomor !== 'string' || platNomor.trim() === '') {
      return errorResponse(res, 'Plat nomor wajib diisi', 400);
    }
    if (!jenis || (jenis !== 'motor' && jenis !== 'mobil')) {
      return errorResponse(res, "Jenis kendaraan wajib diisi ('motor' atau 'mobil')", 400);
    }

    // Nama pemilik bersifat opsional, jika tidak diisi default ke 'Umum'
    const namaPemilik = (pemilik && typeof pemilik === 'string' && pemilik.trim() !== '')
      ? pemilik.trim()
      : 'Umum';

    const cleanPlat = platNomor.trim().toUpperCase();

    // Cek duplikasi platNomor
    const existing = await Kendaraan.getByPlat(cleanPlat);
    if (existing) {
      return errorResponse(res, 'Plat nomor sudah terdaftar dalam sistem', 400);
    }

    const result = await Kendaraan.create(cleanPlat, jenis.toLowerCase(), namaPemilik)

    const newKendaraan = await Kendaraan.getById(result.lastID)

    return successResponse(res, newKendaraan, 'Kendaraan berhasil didaftarkan', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/kendaraan/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { platNomor, jenis, pemilik } = req.body;
    const existing = await Kendaraan.getById(id)

    if (!existing) {
      return errorResponse(res, 'Kendaraan tidak ditemukan', 404);
    }

    if (platNomor === undefined && jenis === undefined && pemilik === undefined) {
      return errorResponse(res, 'Minimal satu kolom harus diisi untuk memperbarui data', 400);
    }

    if (platNomor !== undefined) {
      if (typeof platNomor !== 'string' || platNomor.trim() === '') {
        return errorResponse(res, 'Plat nomor tidak valid', 400);
      }
      const duplicate = await Kendaraan.checkDuplicateByPlatAndNotId(platNomor.trim().toUpperCase(), id)

      if (duplicate) {
        return errorResponse(res, 'Plat nomor sudah terdaftar pada kendaraan lain', 400);
      }
    }

    if (jenis !== undefined && jenis !== 'motor' && jenis !== 'mobil') {
      return errorResponse(res, "Jenis kendaraan harus 'motor' atau 'mobil'", 400);
    }

    if (pemilik !== undefined && (typeof pemilik !== 'string' || pemilik.trim() === '')) {
      return errorResponse(res, 'Nama pemilik tidak valid', 400);
    }

    const updatedPlat = platNomor !== undefined ? platNomor.trim().toUpperCase() : existing.platNomor;
    const updatedJenis = jenis !== undefined ? jenis.toLowerCase() : existing.jenis;
    const updatedPemilik = pemilik !== undefined ? pemilik.trim() : existing.pemilik;

    await Kendaraan.updateById(id, updatedPlat, updatedJenis, updatedPemilik)

    const updated = await Kendaraan.getById(id)
    return successResponse(res, updated, 'Data kendaraan berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/kendaraan/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Kendaraan.getById(id)

    if (!existing) {
      return errorResponse(res, 'Kendaraan tidak ditemukan', 404);
    }

    // Cek apakah kendaraan masih ada transaksi AKTIF
    const activeTx = await query.get(
      "SELECT COUNT(*) as count FROM TransaksiParkir WHERE kendaraanId = ? AND status = 'AKTIF'",
      [id]
    );

    if (activeTx && activeTx.count > 0) {
      return errorResponse(res, 'Kendaraan tidak dapat dihapus karena masih berada di area parkir (transaksi aktif)', 400);
    }

    // Hapus transaksi lama kendaraan ini
    await TransaksiParkir.removeByKendaraanId(id)
    await Kendaraan.remove(id)

    return successResponse(res, null, 'Kendaraan berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getByPlat,
  create,
  update,
  remove
};
