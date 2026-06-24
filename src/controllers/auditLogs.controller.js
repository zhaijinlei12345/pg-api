const auditLogService = require('../services/auditLog.service');
const { paginated } = require('../utils/response');

async function list(req, res, next) {
  try {
    const result = await auditLogService.list(req.query);
    return paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
