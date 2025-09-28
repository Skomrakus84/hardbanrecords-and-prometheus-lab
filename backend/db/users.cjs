// backend/db/users.cjs
const db = require('../db.cjs');
const bcrypt = require('bcryptjs');

async function findUserByUsername(username) {
  const res = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  return res.rows[0] || null;
}

async function createUser({ username, password, role = 'user' }) {
  const hash = await bcrypt.hash(password, 10);
  const res = await db.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
    [username, hash, role]
  );
  return res.rows[0];
}

async function validatePassword(user, password) {
  return await bcrypt.compare(password, user.password);
}

module.exports = { findUserByUsername, createUser, validatePassword };