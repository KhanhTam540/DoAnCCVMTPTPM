var express  = require('express');
let router = express.Router();
var { body }  = require('express-validator');
var validate  = require('../middlewares/validate');
var { verifyToken }  = require('../middlewares/auth');
var { getCartItems, addToCart, updateCartItem, removeCartItem }  = require('../controllers/cart.controller');

// All cart routes require authentication
router.use(verifyToken);

// GET /api/v1/cart/items
router.get('/items', getCartItems);

// POST /api/v1/cart/items
router.post('/items', [
  body('part_id').isInt({ min: 1 }).withMessage('Valid part_id is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  validate
], addToCart);

// PUT /api/v1/cart/items/:id
router.put('/items/:id', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  validate
], updateCartItem);

// DELETE /api/v1/cart/items/:id
router.delete('/items/:id', removeCartItem);

module.exports = router;
