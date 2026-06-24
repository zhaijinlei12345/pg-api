const dashboardService = require('../services/dashboard.service');
const { success } = require('../utils/response');

async function stats(_req, res, next) {
  try {
    const data = await dashboardService.getStats();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { stats };
