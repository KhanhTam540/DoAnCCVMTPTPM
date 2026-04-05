var express  = require('express');
let router = express.Router();
var { getYearsByModel }  = require('../controllers/model.controller');

// GET /api/v1/models/:id/years
router.get('/:id/years', getYearsByModel);

module.exports = router;
