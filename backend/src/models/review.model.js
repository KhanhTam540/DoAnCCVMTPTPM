var db  = require('../config/db');

let findReviewSummaryByPartId = async (partId) => {
  let [rows] = await db.query(
    `SELECT 
      COUNT(*) as review_count,
      ROUND(AVG(rating), 1) as avg_rating,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star_5,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star_4,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star_3,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star_2,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star_1
     FROM part_reviews WHERE part_id = ?`,
    [partId]
  );

  return rows;
};

let findReviewsByPartId = async (partId) => {
  let [rows] = await db.query(
    `SELECT pr.*, u.username, u.full_name
     FROM part_reviews pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.part_id = ?
     ORDER BY pr.created_at DESC`,
    [partId]
  );

  return rows;
};

let findPartById = async (partId) => {
  let [rows] = await db.query('SELECT id FROM parts WHERE id = ?', [partId]);
  return rows;
};

let findExistingReview = async (partId, userId) => {
  let [rows] = await db.query(
    'SELECT id FROM part_reviews WHERE part_id = ? AND user_id = ?',
    [partId, userId]
  );

  return rows;
};

let createReview = async (partId, userId, rating, comment) => {
  let [result] = await db.query(
    'INSERT INTO part_reviews (part_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [partId, userId, rating, comment || null]
  );

  return result;
};

let findReviewById = async (id) => {
  let [rows] = await db.query('SELECT * FROM part_reviews WHERE id = ?', [id]);
  return rows;
};

let updateReviewById = async (id, rating, comment) => {
  let [result] = await db.query(
    'UPDATE part_reviews SET rating = ?, comment = ? WHERE id = ?',
    [rating, comment || null, id]
  );

  return result;
};

let deleteReviewById = async (id) => {
  let [result] = await db.query('DELETE FROM part_reviews WHERE id = ?', [id]);
  return result;
};

module.exports = {
  findReviewSummaryByPartId,
  findReviewsByPartId,
  findPartById,
  findExistingReview,
  createReview,
  findReviewById,
  updateReviewById,
  deleteReviewById
};
