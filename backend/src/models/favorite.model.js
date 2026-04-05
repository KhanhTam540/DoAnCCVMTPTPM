var db  = require('../config/db');

let findFavoritesByUserId = async (userId) => {
  let [rows] = await db.query(
    `SELECT p.*, c.name as category_name
     FROM favorite_parts fp
     JOIN parts p ON fp.part_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE fp.user_id = ?
     ORDER BY fp.created_at DESC`,
    [userId]
  );

  return rows;
};

let findFavoriteByUserAndPart = async (userId, partId) => {
  let [rows] = await db.query(
    'SELECT * FROM favorite_parts WHERE user_id = ? AND part_id = ?',
    [userId, partId]
  );

  return rows;
};

let deleteFavoriteByUserAndPart = async (userId, partId) => {
  let [result] = await db.query('DELETE FROM favorite_parts WHERE user_id = ? AND part_id = ?', [userId, partId]);
  return result;
};

let insertFavorite = async (userId, partId) => {
  let [result] = await db.query('INSERT INTO favorite_parts (user_id, part_id) VALUES (?, ?)', [userId, partId]);
  return result;
};

module.exports = {
  findFavoritesByUserId,
  findFavoriteByUserAndPart,
  deleteFavoriteByUserAndPart,
  insertFavorite
};
