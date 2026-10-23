const express = require('express');
const router = express.Router();
const kendaraanController = require('../controllers/kendaraan.controller');

router.get('/', kendaraanController.getAll);
router.get('/plat/:platNomor', kendaraanController.getByPlat);
router.get('/:id', kendaraanController.getById);
router.post('/', kendaraanController.create);
router.put('/:id', kendaraanController.update);
router.delete('/:id', kendaraanController.remove);

module.exports = router;
