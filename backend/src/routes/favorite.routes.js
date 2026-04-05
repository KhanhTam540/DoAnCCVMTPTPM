var express  = require('express');
let router = express.Router();
var favoriteController  = require('../controllers/favorite.controller');
var { verifyToken }  = require('../middlewares/auth');

// Các API này cần đăng nhập
router.use(verifyToken);

router.get('/', favoriteController.getFavorites);
router.post('/toggle', favoriteController.toggleFavorite);
router.get('/check/:partId', favoriteController.checkFavorite);

module.exports = router;
