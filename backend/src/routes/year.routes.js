var express  = require('express');
let router = express.Router();
var { getCompatibleParts }  = require('../controllers/year.controller');

// GET /api/v1/years/:id/compatibility
router.get('/:id/compatibility', getCompatibleParts);

module.exports = router;
