const productService = require('../services/product.service');
const { success, paginated } = require('../utils/response');

async function list(req, res, next) {
  try {
    const result = await productService.list(req.query);
    return paginated(res, result.data, result.pagination);
  } catch (err) { next(err); }
}
async function getById(req, res, next) {
  try {
    const data = await productService.getById(Number(req.params.id));
    return success(res, data);
  } catch (err) { next(err); }
}
async function create(req, res, next) {
  try {
    const data = await productService.create(req.body);
    return success(res, data, '创建成功', 201);
  } catch (err) { next(err); }
}
async function update(req, res, next) {
  try {
    const data = await productService.update(Number(req.params.id), req.body);
    return success(res, data, '更新成功');
  } catch (err) { next(err); }
}
async function remove(req, res, next) {
  try {
    const data = await productService.remove(Number(req.params.id));
    return success(res, data, '删除成功');
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove };
