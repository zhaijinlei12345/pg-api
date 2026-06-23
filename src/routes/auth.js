const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const pool = require('../db');
const { validate } = require('../middleware/validate');

const router = express.Router();

/**
 * 生成 JWT
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * @swagger
 * /api/auth/register:
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
  async (req, res) => {
    try {
      const { name, email, password, age } = req.body;

      // 检查邮箱是否已注册
      const exist = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (exist.rowCount > 0) {
        return res.status(409).json({ success: false, message: '该邮箱已注册' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        'INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING id, name, email, age, created_at',
        [name, email, hashedPassword, age || null]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: { user, token },
      });
    } catch (err) {
      console.error('注册失败:', err.message);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
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
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // 查询用户（带上 password 字段）
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rowCount === 0) {
        return res.status(401).json({ success: false, message: '邮箱或密码错误' });
      }

      const user = result.rows[0];

      // 用户没有密码（之前创建的老用户）
      if (!user.password) {
        return res.status(401).json({ success: false, message: '该账号未设置密码，请先注册' });
      }

      // 比对密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: '邮箱或密码错误' });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        message: '登录成功',
        data: {
          user: { id: user.id, name: user.name, email: user.email, age: user.age, created_at: user.created_at },
          token,
        },
      });
    } catch (err) {
      console.error('登录失败:', err.message);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

module.exports = router;
