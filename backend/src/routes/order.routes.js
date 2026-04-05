var express  = require('express');
let router = express.Router();
var { verifyToken }  = require('../middlewares/auth');
var { createOrder, getOrders, getOrderById }  = require('../controllers/order.controller');

// All order routes require authentication
router.use(verifyToken);

// POST /api/v1/orders
router.post('/', createOrder);

// GET /api/v1/orders
router.get('/', getOrders);

// GET /api/v1/orders/:id
router.get('/:id', getOrderById);

module.exports = router;
