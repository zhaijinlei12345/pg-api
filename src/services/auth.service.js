const bcrypt = require('bcryptjs');
const pool = require('../db');
const { signToken } = require('../utils/jwt');
const { UnauthorizedError, ConflictError, NotFoundError } = require('../errors/AppError');

/**
 * 用户注册
 */
async function register(name, email, password, age) {
  const exist = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (exist.rowCount > 0) {
    throw new ConflictError('该邮箱已注册');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (name, email, password, age, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, age, role, created_at',
    [name, email, hashedPassword, age || null, 'user']
  );

  const user = result.rows[0];
  const token = signToken(user);

  return { user, token };
}

/**
 * 用户登录
 */
async function login(email, password) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rowCount === 0) {
    throw new UnauthorizedError('邮箱或密码错误');
  }

  const user = result.rows[0];

  // 老用户无密码
  if (!user.password) {
    throw new UnauthorizedError('该账号未设置密码，请先注册');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('邮箱或密码错误');
  }

  const token = signToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role,
      created_at: user.created_at,
    },
    token,
  };
}

/**
 * 获取当前用户（刷新 token）
 */
async function getMe(userId) {
  const result = await pool.query(
    'SELECT id, name, email, age, role, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (result.rowCount === 0) {
    throw new NotFoundError('用户不存在');
  }

  const user = result.rows[0];
  const token = signToken(user);

  return { user, token };
}

module.exports = { register, login, getMe };
