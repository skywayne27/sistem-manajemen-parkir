const express = require('express');
const router = express.Router();
const areaParkirController = require('../controllers/areaParkir.controller');

router.get('/', areaParkirController.getAll);
router.get('/:id', areaParkirController.getById);
router.post('/', areaParkirController.create);
router.put('/:id', areaParkirController.update);
router.delete('/:id', areaParkirController.remove);

module.exports = router;
