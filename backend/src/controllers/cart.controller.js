var cartModel  = require('../models/cart.model');

// GET /api/v1/cart/items
let getCartItems = async (req, res) => {
  try {
    let items = await cartModel.findCartItemsByUserId(req.user.id);

    let total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({ success: true, data: { items, total } });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/cart/items
let addToCart = async (req, res) => {
  try {
    let { part_id, quantity = 1 } = req.body;

    // Check stock
    let parts = await cartModel.findPartStockById(part_id);
    if (parts.length === 0) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    if (parts[0].stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${parts[0].stock_quantity}` });
    }

    // Upsert cart item
    await cartModel.upsertCartItem(req.user.id, part_id, quantity);

    res.status(201).json({ success: true, message: `Added ${parts[0].name} to cart` });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/cart/items/:id
let updateCartItem = async (req, res) => {
  try {
    let { quantity } = req.body;

    // Get cart item and check stock
    let items = await cartModel.findCartItemWithStockById(req.params.id, req.user.id);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    if (items[0].stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${items[0].stock_quantity}` });
    }

    await cartModel.updateCartItemQuantityById(quantity, req.params.id, req.user.id);

    res.json({ success: true, message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/cart/items/:id
let removeCartItem = async (req, res) => {
  try {
    let result = await cartModel.deleteCartItemById(req.params.id, req.user.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCartItems, addToCart, updateCartItem, removeCartItem };
