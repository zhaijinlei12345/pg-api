const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 用户注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 张三
 *               email:
 *                 type: string
 *                 format: email
 *                 example: zhangsan@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *               age:
 *                 type: integer
 *                 example: 28
 *     responses:
 *       201:
 *         description: 注册成功，返回 JWT
 *       400:
 *         description: 参数校验失败
 *       409:
 *         description: 邮箱已存在
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6位'),
    body('age').optional().isInt({ min: 0, max: 200 }).withMessage('年龄需要在0-200之间'),
    validate,
  ],
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 用户登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: zhangsan@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 登录成功，返回 JWT
 *       401:
 *         description: 邮箱或密码错误
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').notEmpty().withMessage('密码不能为空'),
    validate,
  ],
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: 获取当前用户信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 当前用户
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @swagger
 * /api/v1/auth/password:
 *   put:
 *     tags: [Auth]
 *     summary: 修改密码
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: 密码修改成功
 *       401:
 *         description: 原密码错误
 */
router.put(
  '/password',
  authenticate,
  [
    body('oldPassword').notEmpty().withMessage('请输入原密码'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位'),
    validate,
  ],
  authController.changePassword
);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: 更新个人信息
 *     security:
 *       - bearerAuth: []
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
 *         description: 更新成功，返回用户信息和新的 JWT
 */
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('姓名不能为空'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    body('age').optional().isInt({ min: 0, max: 200 }).withMessage('年龄须在 0-200'),
    validate,
  ],
  authController.updateProfile
);

/**
 * @swagger
 * /api/v1/auth/permissions:
 *   get:
 *     tags: [Auth]
 *     summary: 获取当前用户权限列表
 *     security:
 *       - bearerAuth: []
 */
router.get('/permissions', authenticate, authController.getPermissions);

module.exports = router;
