var express  = require('express');
let router = express.Router();
var { getCompareData }  = require('../controllers/compare.controller');

// GET /api/v1/compare?ids=1,2,3 - Public route
router.get('/', getCompareData);

module.exports = router;
