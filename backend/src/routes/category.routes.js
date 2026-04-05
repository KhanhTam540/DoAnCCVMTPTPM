var express  = require('express');
let router = express.Router();
var { getAllCategories }  = require('../controllers/category.controller');

// GET /api/v1/categories
router.get('/', getAllCategories);

module.exports = router;
