var db  = require('../config/db');

let getConnection = async () => db.getConnection();
var { createNotification }  = require('./notification.model');


let findCartItemsForCheckout = async (connection, userId) => {
  let [rows] = await connection.query(
    `SELECT ci.id, ci.part_id, ci.quantity, p.price, p.stock_quantity, p.name
     FROM cart_items ci
     JOIN parts p ON ci.part_id = p.id
     WHERE ci.user_id = ?`,
    [userId]
  );

  return rows;
};

let createOrderRecord = async (connection, userId, totalAmount, status) => {
  let [result] = await connection.query(
    'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
    [userId, totalAmount, status]
  );

  return result;
};

let createOrderItem = async (connection, orderId, partId, quantity, price) => {
  let [result] = await connection.query(
    'INSERT INTO order_items (order_id, part_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
    [orderId, partId, quantity, price]
  );

  return result;
};

let decrementPartStock = async (connection, quantity, partId) => {
  // 1. Trừ kho
  await connection.query(
    'UPDATE parts SET stock_quantity = stock_quantity - ? WHERE id = ?',
    [quantity, partId]
  );

  // 2. Kiểm tra lượng tồn kho còn lại
  let [rows] = await connection.query(
    'SELECT name, stock_quantity FROM parts WHERE id = ?',
    [partId]
  );
  
  let part = rows[0];
  let LOW_STOCK_THRESHOLD = 5; // Ngưỡng cảnh báo

  if (part.stock_quantity <= LOW_STOCK_THRESHOLD) {
    // 3. Tìm các tài khoản Admin để gửi thông báo
    let [admins] = await connection.query(
      `SELECT u.id FROM users u 
       JOIN user_roles ur ON u.id = ur.user_id 
       JOIN roles r ON ur.role_id = r.id 
       WHERE r.name = 'ADMIN'`
    );

    for (let admin of admins) {
      await createNotification(
        connection,
        admin.id,
        'SYSTEM_ALERT',
        'Cảnh báo hết hàng!',
        `Sản phẩm "${part.name}" chỉ còn ${part.stock_quantity} cái trong kho.`,
        { partId: partId, currentStock: part.stock_quantity }
      );
    }
  }
};

let clearCartByUserId = async (connection, userId) => {
  let [result] = await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  return result;
};

let findOrdersByUserId = async (userId) => {
  let [rows] = await db.query(
    `SELECT id, total_amount, status, order_date
     FROM orders WHERE user_id = ?
     ORDER BY order_date DESC`,
    [userId]
  );

  return rows;
};

let findOrderItemsByOrderId = async (orderId) => {
  let [rows] = await db.query(
    `SELECT oi.*, p.name as part_name, p.image_url
     FROM order_items oi
     JOIN parts p ON oi.part_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return rows;
};

// --- PHẦN SỬA ĐỔI CHÍNH Ở ĐÂY ---
let findOrderByIdForUser = async (id, userId) => {
  let [rows] = await db.query(
    `SELECT o.*, u.username, u.email, u.full_name, u.phone, u.address,
            sb.id as booking_id
     FROM orders o
     JOIN users u ON o.user_id = u.id
     LEFT JOIN service_bookings sb ON o.id = sb.order_id
     WHERE o.id = ? AND o.user_id = ?`,
    [id, userId]
  );

  return rows;
};
// -------------------------------

let findAllOrders = async () => {
  let [rows] = await db.query(
    `SELECT o.*, u.username, u.email, u.full_name, u.phone, u.address
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.order_date DESC`
  );

  return rows;
};

let findOrderById = async (connection, id) => {
  let [rows] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
  return rows;
};

let updateOrderStatusById = async (connection, status, id) => {
  let [result] = await connection.query(
    'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, id]
  );

  return result;
};

module.exports = {
  getConnection,
  findCartItemsForCheckout,
  createOrderRecord,
  createOrderItem,
  decrementPartStock,
  clearCartByUserId,
  findOrdersByUserId,
  findOrderItemsByOrderId,
  findOrderByIdForUser,
  findAllOrders,
  findOrderById,
  updateOrderStatusById
};