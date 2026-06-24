const express = require('express');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/requirePermission');
const usersController = require('../controllers/users.controller');
const { PERMISSIONS, ALLOWED_USER_SORT_FIELDS } = require('../constants');

const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: 查询用户列表（分页/搜索/排序）
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchField
 *         schema:
 *           type: string
 *           enum: [all, id, name, email, age]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [id, name, email, age, created_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: 用户列表（含分页信息）
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page 须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit 须在 1-100 之间'),
    query('sort').optional().isIn(ALLOWED_USER_SORT_FIELDS).withMessage(`sort 须为 ${ALLOWED_USER_SORT_FIELDS.join('/')} 之一`),
    query('order').optional().isIn(['asc', 'desc']).withMessage('order 须为 asc 或 desc'),
    query('searchField').optional().isIn(['all', 'id', 'name', 'email', 'age']).withMessage('searchField 不合法'),
    validate,
  ],
  usersController.list
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: 查询单个用户
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 用户详情
 *       404:
 *         description: 用户不存在
 */
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('id 须为正整数'),
    validate,
  ],
  usersController.getById
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     summary: 新增用户（需认证）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               age:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 创建成功
 *       401:
 *         description: 未认证
 *       409:
 *         description: 邮箱已存在
 */
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.USERS.WRITE),
  [
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('age').optional().isInt({ min: 0, max: 200 }).withMessage('年龄须在 0-200 之间'),
    validate,
  ],
  usersController.create
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: 修改用户（需认证）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未认证
 *       404:
 *         description: 用户不存在
 */
router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.USERS.WRITE),
  [
    param('id').isInt({ min: 1 }).withMessage('id 须为正整数'),
    body('name').optional().notEmpty().withMessage('姓名不能为空'),
    body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
    body('age').optional().isInt({ min: 0, max: 200 }).withMessage('年龄须在 0-200 之间'),
    validate,
  ],
  usersController.update
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: 删除用户（需认证+管理员）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.USERS.DELETE),
  [
    param('id').isInt({ min: 1 }).withMessage('id 须为正整数'),
    validate,
  ],
  usersController.remove
);

module.exports = router;
