const pool = require('../db');
const { NotFoundError } = require('../errors/AppError');

async function list({ page = 1, limit = 10, status = '', search = '' } = {}) {
  page = parseInt(page); limit = parseInt(limit); const offset = (page - 1) * limit;

  const conditions = []; const values = []; let idx = 1;
  if (status) { conditions.push(`o.status = $${idx++}`); values.push(status); }
  if (search) { conditions.push(`(o.order_no ILIKE $${idx} OR o.customer_name ILIKE $${idx})`); values.push(`%${search}%`); idx++; }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const count = await pool.query(`SELECT COUNT(*) FROM orders o ${where}`, values);
  const total = parseInt(count.rows[0].count);

  const data = await pool.query(
    `SELECT o.*, COALESCE(json_agg(json_build_object('id',oi.id,'product_name',oi.product_name,'quantity',oi.quantity,'unit_price',oi.unit_price,'subtotal',oi.subtotal)) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
     FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
     ${where} GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );

  return { data: data.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getById(id) {
  const r = await pool.query(
    `SELECT o.*, COALESCE(json_agg(json_build_object('id',oi.id,'product_name',oi.product_name,'quantity',oi.quantity,'unit_price',oi.unit_price,'subtotal',oi.subtotal)) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
     FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE o.id = $1 GROUP BY o.id`,
    [id]
  );
  if (r.rowCount === 0) throw new NotFoundError('订单不存在');
  return r.rows[0];
}

async function create(data) {
  const { order_no, customer_name, customer_phone, total_amount, notes, items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const o = await client.query(
      `INSERT INTO orders (order_no,customer_name,customer_phone,total_amount,notes,status) VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,
      [order_no, customer_name, customer_phone, total_amount, notes]
    );
    const orderId = o.rows[0].id;
    if (items && items.length) {
      for (const it of items) {
        await client.query(
          `INSERT INTO order_items (order_id,product_name,quantity,unit_price,subtotal) VALUES ($1,$2,$3,$4,$5)`,
          [orderId, it.product_name, it.quantity, it.unit_price, it.quantity * it.unit_price]
        );
      }
    }
    await client.query('COMMIT');
    return o.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally { client.release(); }
}

async function updateStatus(id, status) {
  const r = await pool.query(
    `UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  );
  if (r.rowCount === 0) throw new NotFoundError('订单不存在');
  return r.rows[0];
}

async function remove(id) {
  const r = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
  if (r.rowCount === 0) throw new NotFoundError('订单不存在');
  return r.rows[0];
}

module.exports = { list, getById, create, updateStatus, remove };
