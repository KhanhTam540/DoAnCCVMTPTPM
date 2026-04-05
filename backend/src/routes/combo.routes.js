var express  = require('express');
let router = express.Router();
var comboController  = require('../controllers/combo.controller');

// Trả về danh sách Combos (công khai)
router.get('/', comboController.getCombos);

// Trả về chi tiết combo (công khai)
router.get('/:id', comboController.getComboDetails);

module.exports = router;
