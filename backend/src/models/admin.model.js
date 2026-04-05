var db  = require('../config/db');

let getDashboardOverview = async (startDateStr) => {
  let [rows] = await db.query(
    `SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM users WHERE created_at >= ?) as new_users,
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT COUNT(*) FROM orders WHERE order_date >= ?) as new_orders,
      (SELECT COUNT(*) FROM parts) as total_products,
      (SELECT SUM(stock_quantity) FROM parts) as total_stock,
      (SELECT COUNT(*) FROM parts WHERE stock_quantity = 0) as out_of_stock,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED')) as total_revenue,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED') AND order_date >= ?) as revenue_this_period,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED') AND order_date < ? AND order_date >= DATE_SUB(?, INTERVAL 1 DAY)) as revenue_previous_period`,
    [startDateStr, startDateStr, startDateStr, startDateStr, startDateStr]
  );

  return rows;
};

let getDashboardRevenueByDate = async (startDateStr) => {
  let [rows] = await db.query(
    `SELECT 
      DATE(order_date) as date,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date >= ?
     GROUP BY DATE(order_date)
     ORDER BY date DESC`,
    [startDateStr]
  );

  return rows;
};

let getDashboardOrderStatus = async () => {
  let [rows] = await db.query(
    `SELECT 
      status,
      COUNT(*) as count,
      COALESCE(SUM(total_amount), 0) as total
     FROM orders
     GROUP BY status`
  );

  return rows;
};

let getDashboardBestSelling = async () => {
  let [rows] = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.price,
      p.image_url,
      c.name as category_name,
      COUNT(oi.id) as order_count,
      SUM(oi.quantity) as total_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
     FROM order_items oi
     JOIN parts p ON oi.part_id = p.id
     JOIN categories c ON p.category_id = c.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status IN ('PAID', 'COMPLETED')
     GROUP BY p.id
     ORDER BY total_sold DESC
     LIMIT 10`
  );

  return rows;
};

let getDashboardNewUsersByDate = async (startDateStr) => {
  let [rows] = await db.query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
     FROM users
     WHERE created_at >= ?
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [startDateStr]
  );

  return rows;
};

let getDashboardCategoryStats = async () => {
  let [rows] = await db.query(
    `SELECT 
      c.id,
      c.name,
      COUNT(DISTINCT p.id) as product_count,
      COALESCE(SUM(oi.quantity), 0) as items_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue
     FROM categories c
     LEFT JOIN parts p ON c.id = p.category_id
     LEFT JOIN order_items oi ON p.id = oi.part_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED')
     GROUP BY c.id`
  );

  return rows;
};

let getDashboardRecentOrders = async () => {
  let [rows] = await db.query(
    `SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.order_date,
      u.username,
      u.full_name,
      u.email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.order_date DESC
     LIMIT 10`
  );

  return rows;
};

let getDetailedRevenueSummary = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COALESCE(AVG(total_amount), 0) as avg_order_value,
      MAX(total_amount) as max_order,
      MIN(total_amount) as min_order
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date BETWEEN ? AND ?`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedRevenueByTime = async (groupByClause, startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      ${groupByClause} as period,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date BETWEEN ? AND ?
     GROUP BY ${groupByClause}
     ORDER BY period DESC`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedProductStats = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.price,
      c.name as category_name,
      COUNT(DISTINCT o.id) as order_count,
      SUM(oi.quantity) as total_quantity,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN order_items oi ON p.id = oi.part_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
     GROUP BY p.id
     ORDER BY total_revenue DESC`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedCategoryStats = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      c.id,
      c.name,
      COUNT(DISTINCT p.id) as product_count,
      COUNT(DISTINCT o.id) as order_count,
      SUM(oi.quantity) as items_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue
     FROM categories c
     LEFT JOIN parts p ON c.id = p.category_id
     LEFT JOIN order_items oi ON p.id = oi.part_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
     GROUP BY c.id
     ORDER BY revenue DESC`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedCustomerStats = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      u.id,
      u.username,
      u.full_name,
      u.email,
      COUNT(DISTINCT o.id) as order_count,
      COALESCE(SUM(o.total_amount), 0) as total_spent,
      COALESCE(AVG(o.total_amount), 0) as avg_order_value,
      MAX(o.order_date) as last_order_date
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
     GROUP BY u.id
     HAVING order_count > 0
     ORDER BY total_spent DESC
     LIMIT 20`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedHourlyStats = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      HOUR(order_date) as hour,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date BETWEEN ? AND ?
     GROUP BY HOUR(order_date)
     ORDER BY hour`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedWeekdayStats = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      DAYOFWEEK(order_date) as weekday,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date BETWEEN ? AND ?
     GROUP BY DAYOFWEEK(order_date)
     ORDER BY weekday`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedTopProducts = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.price,
      c.name as category_name,
      SUM(oi.quantity) as total_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
     FROM order_items oi
     JOIN parts p ON oi.part_id = p.id
     JOIN categories c ON p.category_id = c.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status IN ('PAID', 'COMPLETED')
       AND o.order_date BETWEEN ? AND ?
     GROUP BY p.id
     ORDER BY total_sold DESC
     LIMIT 10`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedNewCustomers = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      COUNT(*) as total,
      DATE(created_at) as date
     FROM users
     WHERE created_at BETWEEN ? AND ?
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [startStr, endStr]
  );

  return rows;
};

let getDetailedConversionRate = async (startStr, endStr) => {
  let [rows] = await db.query(
    `SELECT 
      (SELECT COUNT(DISTINCT user_id) FROM orders WHERE order_date BETWEEN ? AND ?) as buyers,
      (SELECT COUNT(*) FROM users WHERE created_at <= ?) as total_users`,
    [startStr, endStr, endStr]
  );

  return rows;
};

let findAllUsers = async () => {
  let [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.address,
            u.is_active, u.created_at, GROUP_CONCAT(r.name) as roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );

  return rows;
};

let findExistingUserByUsernameOrEmail = async (username, email) => {
  let [rows] = await db.query(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  return rows;
};

let createUser = async ({ username, password, email, full_name, phone, address }) => {
  let [result] = await db.query(
    `INSERT INTO users (username, password, email, full_name, phone, address, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [username, password, email, full_name || null, phone || null, address || null]
  );

  return result;
};

let assignUserRole = async (userId, roleId) => {
  let [result] = await db.query(
    'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
    [userId, roleId]
  );

  return result;
};

let updateUserById = async (id, { full_name, phone, address, is_active }) => {
  let [result] = await db.query(
    'UPDATE users SET full_name = ?, phone = ?, address = ?, is_active = ? WHERE id = ?',
    [full_name || null, phone || null, address || null, is_active, id]
  );

  return result;
};

let deleteUserRolesByUserId = async (id) => {
  let [result] = await db.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
  return result;
};

let findOrdersByUserId = async (id) => {
  let [rows] = await db.query('SELECT id FROM orders WHERE user_id = ?', [id]);
  return rows;
};

let deleteUserById = async (id) => {
  let [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result;
};

let updateUserStatusById = async (id, is_active) => {
  let [result] = await db.query(
    'UPDATE users SET is_active = ? WHERE id = ?',
    [is_active, id]
  );

  return result;
};

let getRevenueSummary = async (dateFilter, params) => {
  let [rows] = await db.query(
    `SELECT COALESCE(SUM(total_amount), 0) as total_revenue,
            COUNT(*) as total_orders
     FROM orders o
     WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}`,
    params
  );

  return rows;
};

let getRevenueByDate = async (dateFilter, params) => {
  let [rows] = await db.query(
    `SELECT DATE(o.order_date) as date,
            SUM(o.total_amount) as revenue,
            COUNT(*) as order_count
     FROM orders o
     WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}
     GROUP BY DATE(o.order_date)
     ORDER BY date DESC`,
    params
  );

  return rows;
};

let getRevenueBestSellingParts = async (dateFilter, params) => {
  let [rows] = await db.query(
    `SELECT p.id, p.name, p.price,
            SUM(oi.quantity) as total_sold,
            SUM(oi.quantity * oi.price_at_purchase) as total_revenue
     FROM order_items oi
     JOIN parts p ON oi.part_id = p.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}
     GROUP BY p.id, p.name, p.price
     ORDER BY total_sold DESC
     LIMIT 10`,
    params
  );

  return rows;
};

let getRevenueStatusBreakdown = async (dateFilter, params) => {
  let [rows] = await db.query(
    `SELECT status, COUNT(*) as count
     FROM orders ${dateFilter ? 'WHERE order_date BETWEEN ? AND ?' : ''}
     GROUP BY status`,
    params
  );

  return rows;
};

module.exports = {
  getDashboardOverview,
  getDashboardRevenueByDate,
  getDashboardOrderStatus,
  getDashboardBestSelling,
  getDashboardNewUsersByDate,
  getDashboardCategoryStats,
  getDashboardRecentOrders,
  getDetailedRevenueSummary,
  getDetailedRevenueByTime,
  getDetailedProductStats,
  getDetailedCategoryStats,
  getDetailedCustomerStats,
  getDetailedHourlyStats,
  getDetailedWeekdayStats,
  getDetailedTopProducts,
  getDetailedNewCustomers,
  getDetailedConversionRate,
  findAllUsers,
  findExistingUserByUsernameOrEmail,
  createUser,
  assignUserRole,
  updateUserById,
  deleteUserRolesByUserId,
  findOrdersByUserId,
  deleteUserById,
  updateUserStatusById,
  getRevenueSummary,
  getRevenueByDate,
  getRevenueBestSellingParts,
  getRevenueStatusBreakdown
};
