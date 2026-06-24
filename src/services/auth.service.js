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

/**
 * 修改密码
 */
async function changePassword(userId, oldPassword, newPassword) {
  const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
  if (result.rowCount === 0) {
    throw new NotFoundError('用户不存在');
  }

  const user = result.rows[0];
  if (!user.password) {
    throw new UnauthorizedError('该账号未设置密码，无法修改');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('原密码错误');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

  return { message: '密码修改成功' };
}

/**
 * 更新个人信息
 */
async function updateProfile(userId, { name, email, age }) {
  const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (user.rowCount === 0) {
    throw new NotFoundError('用户不存在');
  }

  // 检查邮箱唯一性
  if (email && email !== user.rows[0].email) {
    const exist = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
    if (exist.rowCount > 0) {
      throw new ConflictError('该邮箱已被使用');
    }
  }

  const fields = [];
  const values = [];
  let idx = 1;
  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
  if (age !== undefined) { fields.push(`age = $${idx++}`); values.push(age); }

  if (fields.length === 0) {
    return user.rows[0];
  }

  values.push(userId);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, age, role, created_at`,
    values
  );

  const updated = result.rows[0];
  const token = signToken(updated);

  return { user: updated, token };
}

const { ROLE_PERMISSIONS } = require('../constants');

function getPermissions(role) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return [];
  if (perms.includes('*')) {
    // 展开所有权限点
    const { PERMISSIONS } = require('../constants');
    const all = [];
    for (const mod of Object.values(PERMISSIONS)) {
      for (const p of Object.values(mod)) {
        all.push(p);
      }
    }
    return all;
  }
  return perms;
}

module.exports = { register, login, getMe, changePassword, updateProfile, getPermissions };
