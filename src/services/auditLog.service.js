const pool = require('../db');

/**
 * 写入操作日志
 * @param {number|null} userId - 操作人 ID
 * @param {string} userName - 操作人姓名
 * @param {string} action - CREATE / UPDATE / DELETE
 * @param {string} targetType - 目标类型
 * @param {number|null} targetId - 目标 ID
 * @param {object|null} details - 详细信息
 */
async function log(userId, userName, action, targetType, targetId, details) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, userName, action, targetType, targetId, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('写入操作日志失败:', err.message);
    // 日志写入失败不影响主流程
  }
}

/**
 * 查询操作日志（分页 + 筛选）
 */
async function list({ page, limit, action } = {}) {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const values = [];

  if (action) {
    whereClause = 'WHERE action = $1';
    values.push(action);
  }

  // 总数
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM audit_logs ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count);

  // 数据
  const dataIdx = values.length + 1;
  const result = await pool.query(
    `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${dataIdx} OFFSET $${dataIdx + 1}`,
    [...values, limit, offset]
  );

  return {
    data: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = { log, list };
