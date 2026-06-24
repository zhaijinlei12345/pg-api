const pool = require('../db');
const { ROLES, ALLOWED_USER_SORT_FIELDS } = require('../constants');
const { NotFoundError, ConflictError } = require('../errors/AppError');
const auditLogService = require('./auditLog.service');

/**
 * 查询用户列表（分页/搜索/排序）
 */
async function list({ page = 1, limit = 10, search = '', searchField = 'all', sort = 'id', order = 'ASC' } = {}) {
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;
  sort = ALLOWED_USER_SORT_FIELDS.includes(sort) ? sort : 'id';
  order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let whereClause = '';
  const values = [];

  if (search) {
    const fieldMap = {
      id: 'id::text ILIKE $1',
      name: 'name ILIKE $1',
      email: 'email ILIKE $1',
      age: 'age::text ILIKE $1',
    };
    if (searchField === 'all') {
      whereClause = `WHERE ${Object.values(fieldMap).join(' OR ')}`;
    } else if (fieldMap[searchField]) {
      whereClause = `WHERE ${fieldMap[searchField]}`;
    }
    values.push(`%${search}%`);
  }

  // 总数
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count);

  // 数据
  const dataIdx = values.length + 1;
  const result = await pool.query(
    `SELECT id, name, email, age, role, created_at FROM users ${whereClause} ORDER BY ${sort} ${order} LIMIT $${dataIdx} OFFSET $${dataIdx + 1}`,
    [...values, limit, offset]
  );

  return {
    data: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * 查询单个用户
 */
async function getById(id) {
  const result = await pool.query(
    'SELECT id, name, email, age, role, created_at FROM users WHERE id = $1',
    [id]
  );
  if (result.rowCount === 0) {
    throw new NotFoundError('用户不存在');
  }
  return result.rows[0];
}

/**
 * 新增用户
 */
async function create(data, operatorId, operatorEmail) {
  const { name, email, age, role } = data;

  // 检查邮箱唯一性
  const exist = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (exist.rowCount > 0) {
    throw new ConflictError('该邮箱已存在');
  }

  const result = await pool.query(
    'INSERT INTO users (name, email, age, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, age, role, created_at',
    [name, email, age || null, role || ROLES.USER]
  );
  const newUser = result.rows[0];

  await auditLogService.log(operatorId, operatorEmail, 'CREATE', 'user', newUser.id, { name, email, age });

  return newUser;
}

/**
 * 更新用户
 */
async function update(id, data, operatorId, operatorEmail, operatorRole) {
  const { name, email, age, role } = data;

  // 检查用户是否存在
  const check = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (check.rowCount === 0) {
    throw new NotFoundError('用户不存在');
  }

  // 构建动态 UPDATE
  const fields = [];
  const values = [];
  let idx = 1;
  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
  if (age !== undefined) { fields.push(`age = $${idx++}`); values.push(age); }
  if (role !== undefined) { fields.push(`role = $${idx++}`); values.push(role); }
  values.push(id);

  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, age, role, created_at`,
    values
  );
  const updatedUser = result.rows[0];

  // 记录变更
  const oldRow = check.rows[0];
  const changes = {};
  if (name !== undefined && name !== oldRow.name) changes.name = { from: oldRow.name, to: name };
  if (email !== undefined && email !== oldRow.email) changes.email = { from: oldRow.email, to: email };
  if (age !== undefined && age !== oldRow.age) changes.age = { from: oldRow.age, to: age };
  if (role !== undefined && role !== oldRow.role) changes.role = { from: oldRow.role, to: role };
  await auditLogService.log(operatorId, operatorEmail, 'UPDATE', 'user', Number(id),
    Object.keys(changes).length > 0 ? changes : null);

  return updatedUser;
}

/**
 * 删除用户
 */
async function remove(id, operatorId, operatorEmail) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, name, email, age, role, created_at',
    [id]
  );
  if (result.rowCount === 0) {
    throw new NotFoundError('用户不存在');
  }

  const deletedUser = result.rows[0];
  await auditLogService.log(operatorId, operatorEmail, 'DELETE', 'user', deletedUser.id,
    { name: deletedUser.name, email: deletedUser.email });

  return deletedUser;
}

module.exports = { list, getById, create, update, remove };
