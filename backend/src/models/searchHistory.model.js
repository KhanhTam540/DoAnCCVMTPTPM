var db  = require('../config/db');

let findRecentSearchByUser = async (userId, query, searchType) => {
  let [recent] = await db.query(
    `SELECT id FROM search_history 
     WHERE user_id = ? AND query = ? AND search_type = ? 
     AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
     LIMIT 1`,
    [userId, query, searchType]
  );
  return recent;
};

let updateSearchHistoryResult = async (id, resultsCount) => {
  let [result] = await db.query(
    'UPDATE search_history SET results_count = ?, created_at = NOW() WHERE id = ?',
    [resultsCount, id]
  );
  return result;
};

let createSearchHistory = async (userId, searchType, query, filtersJson, resultsCount) => {
  let [result] = await db.query(
    `INSERT INTO search_history (user_id, search_type, query, filters, results_count) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, searchType, query, filtersJson, resultsCount]
  );
  return result;
};

let trimSearchHistoryByUser = async (userId) => {
  let [result] = await db.query(
    `DELETE FROM search_history 
     WHERE user_id = ? AND id NOT IN (
       SELECT id FROM (
         SELECT id FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 100
       ) as recent
     )`,
    [userId, userId]
  );
  return result;
};

let findSearchHistoryByUser = async (userId, searchType, limit) => {
  let where = 'WHERE user_id = ?';
  let params = [userId];

  if (searchType) {
    where += ' AND search_type = ?';
    params.push(searchType);
  }

  let [history] = await db.query(
    `SELECT * FROM search_history 
     ${where}
     ORDER BY created_at DESC 
     LIMIT ?`,
    [...params, limit]
  );

  return history;
};

let deleteSearchHistoryItem = async (id, userId) => {
  let [result] = await db.query(
    'DELETE FROM search_history WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result;
};

let deleteAllSearchHistoryByUser = async (userId) => {
  let [result] = await db.query('DELETE FROM search_history WHERE user_id = ?', [userId]);
  return result;
};

module.exports = {
  findRecentSearchByUser,
  updateSearchHistoryResult,
  createSearchHistory,
  trimSearchHistoryByUser,
  findSearchHistoryByUser,
  deleteSearchHistoryItem,
  deleteAllSearchHistoryByUser
};
