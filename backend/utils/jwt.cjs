// backend/utils/jwt.cjs
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'placeholder_dev_secret_replace_in_production';

function generateToken(payload, expiresIn = '2h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = { generateToken };
