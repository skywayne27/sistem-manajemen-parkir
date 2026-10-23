const {query} = require('../config/db')
const { AreaParkir } = require('../models/areaParkir.model');
const { successResponse, errorResponse } = require('../helpers/response');

// Helper untuk menghitung slot tersedia pada satu area
const getAreaWithSlots = async (areaId) => {
  const area = await AreaParkir.getById(areaId);
  if (!area) return null;

  // Hitung motor aktif di area ini
  const motorActive = await AreaParkir.countActiveMotorByAreaId(areaId)

  // Hitung mobil aktif di area ini
  const mobilActive = await AreaParkir.countActiveMobilByAreaId(areaId)

  const slotMotorTersedia = Math.max(0, area.kapasitasMotor - (motorActive?.count || 0));
  const slotMobilTersedia = Math.max(0, area.kapasitasMobil - (mobilActive?.count || 0));

  return {
    ...area,
    slotMotorTersedia,
    slotMobilTersedia
  };
};

// GET /api/area-parkir
const getAll = async (req, res, next) => {
  try {
    const areas = await AreaParkir.getAll();

    // Hitung slot tersedia untuk masing-masing area
    const data = await Promise.all(
      areas.map(async (area) => {
        const motorActive = await AreaParkir.countActiveMotorByAreaId(area.id)
        const mobilActive = await AreaParkir.countActiveMobilByAreaId(area.id)

        return {
          ...area,
          slotMotorTersedia: Math.max(0, area.kapasitasMotor - (motorActive?.count || 0)),
          slotMobilTersedia: Math.max(0, area.kapasitasMobil - (mobilActive?.count || 0))
        };
      })
    );

    return successResponse(res, data, 'Berhasil mengambil data area parkir');
  } catch (error) {
    next(error);
  }
};

// GET /api/area-parkir/:id
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const area = await getAreaWithSlots(id);

    if (!area) {
      return errorResponse(res, 'Area parkir tidak ditemukan', 404);
    }

    return successResponse(res, area, 'Berhasil mengambil detail area parkir');
  } catch (error) {
    next(error);
  }
};

// POST /api/area-parkir
const create = async (req, res, next) => {
  try {
    const { nama, lokasi, kapasitasMotor, kapasitasMobil, tarifPerJamMotor, tarifPerJamMobil } = req.body;

    // Validasi
    if (!nama || typeof nama !== 'string' || nama.trim() === '') {
      return errorResponse(res, 'Nama area parkir wajib diisi', 400);
    }
    if (!lokasi || typeof lokasi !== 'string' || lokasi.trim() === '') {
      return errorResponse(res, 'Lokasi area parkir wajib diisi', 400);
    }
    if (kapasitasMotor === undefined || isNaN(Number(kapasitasMotor)) || Number(kapasitasMotor) < 0) {
      return errorResponse(res, 'Kapasitas motor harus berupa angka >= 0', 400);
    }
    if (kapasitasMobil === undefined || isNaN(Number(kapasitasMobil)) || Number(kapasitasMobil) < 0) {
      return errorResponse(res, 'Kapasitas mobil harus berupa angka >= 0', 400);
    }
    if (tarifPerJamMotor === undefined || isNaN(Number(tarifPerJamMotor)) || Number(tarifPerJamMotor) <= 0) {
      return errorResponse(res, 'Tarif per jam motor harus berupa angka > 0', 400);
    }
    if (tarifPerJamMobil === undefined || isNaN(Number(tarifPerJamMobil)) || Number(tarifPerJamMobil) <= 0) {
      return errorResponse(res, 'Tarif per jam mobil harus berupa angka > 0', 400);
    }

    const result = await AreaParkir.create(
        nama.trim(),
        lokasi.trim(),
        parseInt(kapasitasMotor, 10),
        parseInt(kapasitasMobil, 10),
        parseInt(tarifPerJamMotor, 10),
        parseInt(tarifPerJamMobil, 10)
    )
    const newArea = await AreaParkir.getById(result.lastID);

    return successResponse(res, newArea, 'Area parkir berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/area-parkir/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await AreaParkir.getById(id);

    if (!existing) {
      return errorResponse(res, 'Area parkir tidak ditemukan', 404);
    }

    const { nama, lokasi, kapasitasMotor, kapasitasMobil, tarifPerJamMotor, tarifPerJamMobil } = req.body;

    if (
      nama === undefined &&
      lokasi === undefined &&
      kapasitasMotor === undefined &&
      kapasitasMobil === undefined &&
      tarifPerJamMotor === undefined &&
      tarifPerJamMobil === undefined
    ) {
      return errorResponse(res, 'Minimal satu kolom harus diisi untuk memperbarui data', 400);
    }

    // Validasi field yang disediakan
    if (nama !== undefined && (typeof nama !== 'string' || nama.trim() === '')) {
      return errorResponse(res, 'Nama area parkir tidak valid', 400);
    }
    if (lokasi !== undefined && (typeof lokasi !== 'string' || lokasi.trim() === '')) {
      return errorResponse(res, 'Lokasi area parkir tidak valid', 400);
    }
    if (kapasitasMotor !== undefined && (isNaN(Number(kapasitasMotor)) || Number(kapasitasMotor) < 0)) {
      return errorResponse(res, 'Kapasitas motor harus berupa angka >= 0', 400);
    }
    if (kapasitasMobil !== undefined && (isNaN(Number(kapasitasMobil)) || Number(kapasitasMobil) < 0)) {
      return errorResponse(res, 'Kapasitas mobil harus berupa angka >= 0', 400);
    }
    if (tarifPerJamMotor !== undefined && (isNaN(Number(tarifPerJamMotor)) || Number(tarifPerJamMotor) <= 0)) {
      return errorResponse(res, 'Tarif motor harus berupa angka > 0', 400);
    }
    if (tarifPerJamMobil !== undefined && (isNaN(Number(tarifPerJamMobil)) || Number(tarifPerJamMobil) <= 0)) {
      return errorResponse(res, 'Tarif mobil harus berupa angka > 0', 400);
    }

    const updatedNama = nama !== undefined ? nama.trim() : existing.nama;
    const updatedLokasi = lokasi !== undefined ? lokasi.trim() : existing.lokasi;
    const updatedKapasitasMotor = kapasitasMotor !== undefined ? parseInt(kapasitasMotor, 10) : existing.kapasitasMotor;
    const updatedKapasitasMobil = kapasitasMobil !== undefined ? parseInt(kapasitasMobil, 10) : existing.kapasitasMobil;
    const updatedTarifMotor = tarifPerJamMotor !== undefined ? parseInt(tarifPerJamMotor, 10) : existing.tarifPerJamMotor;
    const updatedTarifMobil = tarifPerJamMobil !== undefined ? parseInt(tarifPerJamMobil, 10) : existing.tarifPerJamMobil;

    await AreaParkir.updateById(id, [updatedNama, updatedLokasi, updatedKapasitasMotor, updatedKapasitasMobil, updatedTarifMotor, updatedTarifMobil])

    const updated = await AreaParkir.getById(id);
    return successResponse(res, updated, 'Area parkir berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/area-parkir/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await AreaParkir.getById(id)

    if (!existing) {
      return errorResponse(res, 'Area parkir tidak ditemukan', 404);
    }

    // Cek apakah masih ada transaksi AKTIF di area ini
    const activeTx = await AreaParkir.countActiveTrxbyAreaId(id);

    if (activeTx && activeTx.count > 0) {
      return errorResponse(res, 'Area parkir tidak dapat dihapus karena masih memiliki transaksi aktif', 400);
    }

    // Hapus juga riwayat transaksi yang berelasi jika ada (atau periksa constraints)
    await query.run('DELETE FROM TransaksiParkir WHERE areaParkirId = ?', [id]);
    await AreaParkir.removeById(id);

    return successResponse(res, null, 'Area parkir berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
