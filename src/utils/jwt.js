const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 签发 JWT
 * @param {object} user - { id, email, role }
 * @returns {string} JWT token
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * 验证 JWT
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { signToken, verifyToken };
