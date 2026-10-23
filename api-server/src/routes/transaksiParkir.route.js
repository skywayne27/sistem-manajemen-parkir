const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiParkir.controller');

router.post('/', transaksiController.create);
router.get('/', transaksiController.getAll);
router.get('/aktif', transaksiController.getAktif);
router.get('/kendaraan/:kendaraanId', transaksiController.getByKendaraan);
router.get('/:id', transaksiController.getById);
router.put('/:id/keluar', transaksiController.checkout);

module.exports = router;
