var db  = require('../config/db');

let findNotificationsByUserId = async (userId) => {
  let [rows] = await db.query(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [userId]
  );

  return rows;
};

let findUnreadNotificationsByUserId = async (userId) => {
  let [rows] = await db.query(
    `SELECT * FROM notifications 
     WHERE user_id = ? AND is_read = FALSE
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
};

let countUnreadByUserId = async (userId) => {
  let [rows] = await db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );

  return rows;
};

let markAsReadById = async (id, userId) => {
  let [result] = await db.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return result;
};

let markAllAsReadByUserId = async (userId) => {
  let [result] = await db.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );

  return result;
};

let deleteNotificationById = async (id, userId) => {
  let [result] = await db.query(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return result;
};

let deleteAllNotificationsByUserId = async (userId) => {
  let [result] = await db.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
  return result;
};

let createNotification = async (connection, userId, type, title, message, data = {}) => {
  let safeData = data || {};
  let jsonData = JSON.stringify(safeData);

  let [result] = await connection.query(
    `INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at) 
     VALUES (?, ?, ?, ?, ?, FALSE, NOW())`,
    [userId, type, title, message, jsonData]
  );

  return result;
};

module.exports = {
  findNotificationsByUserId,
  findUnreadNotificationsByUserId,
  countUnreadByUserId,
  markAsReadById,
  markAllAsReadByUserId,
  deleteNotificationById,
  deleteAllNotificationsByUserId,
  createNotification
};
