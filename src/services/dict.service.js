const pool = require('../db');
const { NotFoundError, ConflictError } = require('../errors/AppError');

// ==================== 字典类型 ====================

async function listTypes() {
  const result = await pool.query(
    `SELECT dt.*, (SELECT COUNT(*) FROM dict_entries WHERE type_code = dt.code) AS entry_count
     FROM dict_types dt ORDER BY dt.created_at`
  );
  return result.rows;
}

async function getType(code) {
  const result = await pool.query('SELECT * FROM dict_types WHERE code = $1', [code]);
  if (result.rowCount === 0) throw new NotFoundError('字典类型不存在');
  return result.rows[0];
}

async function createType({ code, name, description }) {
  const exist = await pool.query('SELECT id FROM dict_types WHERE code = $1', [code]);
  if (exist.rowCount > 0) throw new ConflictError('字典类型编码已存在');

  const result = await pool.query(
    'INSERT INTO dict_types (code, name, description) VALUES ($1, $2, $3) RETURNING *',
    [code, name, description || null]
  );
  return result.rows[0];
}

async function updateType(code, { name, description }) {
  await getType(code); // ensure exists
  const result = await pool.query(
    `UPDATE dict_types SET
       name = COALESCE($2, name),
       description = COALESCE($3, description)
     WHERE code = $1 RETURNING *`,
    [code, name, description]
  );
  return result.rows[0];
}

async function deleteType(code) {
  await getType(code);
  await pool.query('DELETE FROM dict_types WHERE code = $1', [code]); // CASCADE entries
  return { deleted: code };
}

// ==================== 字典条目 ====================

async function listEntries(typeCode) {
  await getType(typeCode);
  const result = await pool.query(
    'SELECT * FROM dict_entries WHERE type_code = $1 ORDER BY sort_order, id',
    [typeCode]
  );
  return result.rows;
}

async function createEntry(typeCode, { key, label, color, sort_order, enabled }) {
  await getType(typeCode);
  const exist = await pool.query(
    'SELECT id FROM dict_entries WHERE type_code = $1 AND key = $2',
    [typeCode, key]
  );
  if (exist.rowCount > 0) throw new ConflictError('字典条目 key 已存在');

  const result = await pool.query(
    `INSERT INTO dict_entries (type_code, key, label, color, sort_order, enabled)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [typeCode, key, label, color || null, sort_order || 0, enabled !== false]
  );
  return result.rows[0];
}

async function updateEntry(typeCode, key, { label, color, sort_order, enabled }) {
  const check = await pool.query(
    'SELECT * FROM dict_entries WHERE type_code = $1 AND key = $2',
    [typeCode, key]
  );
  if (check.rowCount === 0) throw new NotFoundError('字典条目不存在');

  const result = await pool.query(
    `UPDATE dict_entries SET
       label = COALESCE($3, label),
       color = COALESCE($4, color),
       sort_order = COALESCE($5, sort_order),
       enabled = COALESCE($6, enabled)
     WHERE type_code = $1 AND key = $2 RETURNING *`,
    [typeCode, key, label, color, sort_order, enabled]
  );
  return result.rows[0];
}

async function deleteEntry(typeCode, key) {
  const result = await pool.query(
    'DELETE FROM dict_entries WHERE type_code = $1 AND key = $2 RETURNING *',
    [typeCode, key]
  );
  if (result.rowCount === 0) throw new NotFoundError('字典条目不存在');
  return { deleted: { typeCode, key } };
}

/**
 * 快捷接口：一次返回类型 + 所有启用的条目（前端下拉框用）
 */
async function getDict(code) {
  const type = await pool.query('SELECT * FROM dict_types WHERE code = $1', [code]);
  if (type.rowCount === 0) throw new NotFoundError('字典类型不存在');

  const entries = await pool.query(
    'SELECT key, label, color FROM dict_entries WHERE type_code = $1 AND enabled = TRUE ORDER BY sort_order, id',
    [code]
  );

  return {
    code: type.rows[0].code,
    name: type.rows[0].name,
    entries: entries.rows,
  };
}

module.exports = {
  listTypes, getType, createType, updateType, deleteType,
  listEntries, createEntry, updateEntry, deleteEntry,
  getDict,
};
