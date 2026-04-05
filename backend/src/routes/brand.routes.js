var express  = require('express');
let router = express.Router();
var { getAllBrands, getModelsByBrand }  = require('../controllers/brand.controller');

// GET /api/v1/brands
router.get('/', getAllBrands);

// GET /api/v1/brands/:id/models
router.get('/:id/models', getModelsByBrand);

module.exports = router;
