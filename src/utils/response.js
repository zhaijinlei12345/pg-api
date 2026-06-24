/**
 * 成功响应（不含分页）
 * @param {import('express').Response} res
 * @param {*} data - 响应数据
 * @param {string} [message] - 可选消息
 * @param {number} [statusCode=200]
 */
function success(res, data, message, statusCode = 200) {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

/**
 * 分页响应
 * @param {import('express').Response} res
 * @param {*} data - 列表数据
 * @param {object} pagination - { page, limit, total, totalPages }
 */
function paginated(res, data, pagination) {
  return res.json({ success: true, data, pagination });
}

module.exports = { success, paginated };
