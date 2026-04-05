var db  = require('../config/db');

let findProfileById = async (userId) => {
  let [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.address,
            u.created_at, u.is_active,
            GROUP_CONCAT(r.name) as roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.id = ?
     GROUP BY u.id`,
    [userId]
  );

  return rows;
};

let updateProfileById = async (userId, { full_name, phone, address }) => {
  let [result] = await db.query(
    'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
    [full_name, phone, address, userId]
  );

  return result;
};

let findPasswordByUserId = async (userId) => {
  let [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
  return rows;
};

let updatePasswordByUserId = async (userId, password) => {
  let [result] = await db.query('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
  return result;
};

module.exports = {
  findProfileById,
  updateProfileById,
  findPasswordByUserId,
  updatePasswordByUserId
};
