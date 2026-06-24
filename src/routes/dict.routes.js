const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/requirePermission');
const dictController = require('../controllers/dict.controller');
const { PERMISSIONS } = require('../constants');

const router = express.Router();

// ==================== 字典类型 ====================

/**
 * @swagger
 * /api/v1/dict-types:
 *   get:
 *     tags: [Dict]
 *     summary: 获取所有字典类型
 *     responses:
 *       200:
 *         description: 字典类型列表
 */
router.get('/dict-types', dictController.listTypes);

/**
 * @swagger
 * /api/v1/dict-types:
 *   post:
 *     tags: [Dict]
 *     summary: 新增字典类型（需管理员）
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/dict-types',
  authenticate,
  requirePermission(PERMISSIONS.DICT.MANAGE),
  [
    body('code').notEmpty().matches(/^[a-z_]+$/).withMessage('code 须为小写字母+下划线'),
    body('name').notEmpty().withMessage('名称不能为空'),
    validate,
  ],
  dictController.createType
);

/**
 * @swagger
 * /api/v1/dict-types/{code}:
 *   get:
 *     tags: [Dict]
 *     summary: 获取单个字典类型
 */
router.get('/dict-types/:code', dictController.getType);

router.put(
  '/dict-types/:code',
  authenticate,
  requirePermission(PERMISSIONS.DICT.MANAGE),
  [
    body('name').optional().notEmpty(),
    validate,
  ],
  dictController.updateType
);

router.delete(
  '/dict-types/:code',
  authenticate,
  requirePermission(PERMISSIONS.DICT.MANAGE),
  dictController.deleteType
);

// ==================== 字典条目 ====================

/**
 * @swagger
 * /api/v1/dict-types/{code}/entries:
 *   get:
 *     tags: [Dict]
 *     summary: 获取某个字典类型下的所有条目
 */
router.get('/dict-types/:code/entries', dictController.listEntries);

router.post(
  '/dict-types/:code/entries',
  authenticate,
  requirePermission(PERMISSIONS.DICT.MANAGE),
  [
    body('key').notEmpty().withMessage('key 不能为空'),
    body('label').notEmpty().withMessage('显示名不能为空'),
    validate,
  ],
  dictController.createEntry
);

router.put(
  '/dict-types/:code/entries/:key',
  authenticate,
  requirePermission(PERMISSIONS.DICT.MANAGE),
  dictController.updateEntry
);

router.delete(
  '/dict-types/:code/entries/:key',
  authenticate,
  requirePermission(PERMISSIONS.DICT.MANAGE),
  dictController.deleteEntry
);

// ==================== 快捷接口 ====================

/**
 * @swagger
 * /api/v1/dict/{code}:
 *   get:
 *     tags: [Dict]
 *     summary: 快捷获取字典（类型信息 + 所有启用条目）
 *     description: 前端下拉框组件使用，一次请求拿到所有选项
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: role
 *     responses:
 *       200:
 *         description: 字典数据
 */
router.get('/dict/:code', dictController.getDict);

module.exports = router;
