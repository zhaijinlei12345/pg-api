const pool = require('../db');
const { NotFoundError } = require('../errors/AppError');

async function list({ page = 1, limit = 10, search = '', category = '', status = '', sort = 'id', order = 'ASC' } = {}) {
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;
  order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (category) {
    conditions.push(`category = $${idx}`);
    values.push(category);
    idx++;
  }
  if (status) {
    conditions.push(`status = $${idx}`);
    values.push(status);
    idx++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, values);
  const total = parseInt(countRes.rows[0].count);

  const dataRes = await pool.query(
    `SELECT * FROM products ${whereClause} ORDER BY ${sort} ${order} LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );

  return {
    data: dataRes.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getById(id) {
  const r = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (r.rowCount === 0) throw new NotFoundError('商品不存在');
  return r.rows[0];
}

async function create(data) {
  const { name, description, price, stock, category, image_url, status } = data;
  const r = await pool.query(
    `INSERT INTO products (name, description, price, stock, category, image_url, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, description, price || 0, stock || 0, category, image_url, status || 'active']
  );
  return r.rows[0];
}

async function update(id, data) {
  const check = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
  if (check.rowCount === 0) throw new NotFoundError('商品不存在');

  const fields = [];
  const values = [];
  let idx = 1;
  for (const f of ['name', 'description', 'price', 'stock', 'category', 'image_url', 'status']) {
    if (data[f] !== undefined) {
      fields.push(`${f} = $${idx++}`);
      values.push(data[f]);
    }
  }
  if (!fields.length) return check.rows[0];
  values.push(id);
  const r = await pool.query(
    `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  return r.rows[0];
}

async function remove(id) {
  const r = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
  if (r.rowCount === 0) throw new NotFoundError('商品不存在');
  return r.rows[0];
}

module.exports = { list, getById, create, update, remove };
