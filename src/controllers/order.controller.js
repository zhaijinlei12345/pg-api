const orderService = require('../services/order.service');
const { success, paginated } = require('../utils/response');

async function list(req, res, next) {
  try { const r = await orderService.list(req.query); return paginated(res, r.data, r.pagination); } catch (err) { next(err); }
}
async function getById(req, res, next) {
  try { const r = await orderService.getById(Number(req.params.id)); return success(res, r); } catch (err) { next(err); }
}
async function create(req, res, next) {
  try { const r = await orderService.create(req.body); return success(res, r, '创建成功', 201); } catch (err) { next(err); }
}
async function updateStatus(req, res, next) {
  try { const r = await orderService.updateStatus(Number(req.params.id), req.body.status); return success(res, r, '状态已更新'); } catch (err) { next(err); }
}
async function remove(req, res, next) {
  try { const r = await orderService.remove(Number(req.params.id)); return success(res, r, '删除成功'); } catch (err) { next(err); }
}

module.exports = { list, getById, create, updateStatus, remove };
