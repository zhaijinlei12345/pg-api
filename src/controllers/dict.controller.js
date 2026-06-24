const dictService = require('../services/dict.service');
const { success, paginated } = require('../utils/response');

// ==================== 字典类型 ====================

async function listTypes(_req, res, next) {
  try {
    const data = await dictService.listTypes();
    return success(res, data);
  } catch (err) { next(err); }
}

async function getType(req, res, next) {
  try {
    const data = await dictService.getType(req.params.code);
    return success(res, data);
  } catch (err) { next(err); }
}

async function createType(req, res, next) {
  try {
    const data = await dictService.createType(req.body);
    return success(res, data, '字典类型创建成功', 201);
  } catch (err) { next(err); }
}

async function updateType(req, res, next) {
  try {
    const data = await dictService.updateType(req.params.code, req.body);
    return success(res, data, '字典类型更新成功');
  } catch (err) { next(err); }
}

async function deleteType(req, res, next) {
  try {
    const data = await dictService.deleteType(req.params.code);
    return success(res, data, '字典类型已删除');
  } catch (err) { next(err); }
}

// ==================== 字典条目 ====================

async function listEntries(req, res, next) {
  try {
    const data = await dictService.listEntries(req.params.code);
    return success(res, data);
  } catch (err) { next(err); }
}

async function createEntry(req, res, next) {
  try {
    const data = await dictService.createEntry(req.params.code, req.body);
    return success(res, data, '条目创建成功', 201);
  } catch (err) { next(err); }
}

async function updateEntry(req, res, next) {
  try {
    const data = await dictService.updateEntry(req.params.code, req.params.key, req.body);
    return success(res, data, '条目更新成功');
  } catch (err) { next(err); }
}

async function deleteEntry(req, res, next) {
  try {
    const data = await dictService.deleteEntry(req.params.code, req.params.key);
    return success(res, data, '条目已删除');
  } catch (err) { next(err); }
}

// ==================== 快捷接口 ====================

async function getDict(req, res, next) {
  try {
    const data = await dictService.getDict(req.params.code);
    return success(res, data);
  } catch (err) { next(err); }
}

module.exports = {
  listTypes, getType, createType, updateType, deleteType,
  listEntries, createEntry, updateEntry, deleteEntry,
  getDict,
};
