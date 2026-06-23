const express = require('express');
const { body, query, param } = require('express-validator');
const pool = require('../db');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 排序白名单，防止 SQL 注入
const ALLOWED_SORT = ['id', 'name', 'email', 'age', 'created_at'];

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: 查询用户列表（分页/搜索/排序）
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页条数
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 按 name 和 email 模糊搜索
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [id, name, email, age, created_at]
 *           default: id
 *         description: 排序字段
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 用户列表（含分页信息）
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page 须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit 须在 1-100 之间'),
    query('sort').optional().isIn(ALLOWED_SORT).withMessage(`sort 须为 ${ALLOWED_SORT.join('/')} 之一`),
    query('order').optional().isIn(['asc', 'desc']).withMessage('order 须为 asc 或 desc'),
    query('searchField').optional().isIn(['all', 'id', 'name', 'email', 'age']).withMessage('searchField 不合法'),
    validate,
  ],
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const searchField = req.query.searchField || 'all';
      const sort = ALLOWED_SORT.includes(req.query.sort) ? req.query.sort : 'id';
      const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
      const offset = (page - 1) * limit;

      let whereClause = '';
      const values = [];

      if (search) {
        const fieldMap = {
          id: 'id::text ILIKE $1',
          name: 'name ILIKE $1',
          email: 'email ILIKE $1',
          age: 'age::text ILIKE $1',
        };
        if (searchField === 'all') {
          whereClause = `WHERE ${Object.values(fieldMap).join(' OR ')}`;
        } else if (fieldMap[searchField]) {
          whereClause = `WHERE ${fieldMap[searchField]}`;
        }
        values.push(`%${search}%`);
      }

      // 查询总数
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM users ${whereClause}`,
        values
      );
      const total = parseInt(countResult.rows[0].count);

      // 查询数据（字段索引需避开 $1 给 search 的值）
      const dataIdx = values.length + 1;
      const result = await pool.query(
        `SELECT id, name, email, age, created_at FROM users ${whereClause} ORDER BY ${sort} ${order} LIMIT $${dataIdx} OFFSET $${dataIdx + 1}`,
        [...values, limit, offset]
      );

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error('查询用户列表失败:', err.message);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
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
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, name, email, age, created_at FROM users WHERE id = $1',
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }
      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error('查询用户失败:', err.message);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

/**
 * @swagger
 * /api/users:
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
  [
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('age').optional().isInt({ min: 0, max: 200 }).withMessage('年龄须在 0-200 之间'),
    validate,
  ],
  async (req, res) => {
    try {
      const { name, email, age } = req.body;

      const result = await pool.query(
        'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING id, name, email, age, created_at',
        [name, email, age || null]
      );
      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: result.rows[0],
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ success: false, message: '该邮箱已存在' });
      }
      console.error('创建用户失败:', err.message);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
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
  [
    param('id').isInt({ min: 1 }).withMessage('id 须为正整数'),
    body('name').optional().notEmpty().withMessage('姓名不能为空'),
    body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
    body('age').optional().isInt({ min: 0, max: 200 }).withMessage('年龄须在 0-200 之间'),
    validate,
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, age } = req.body;

      // 至少提供一个字段
      if (!name && !email && age === undefined) {
        return res.status(400).json({ success: false, message: '请至少提供一个要修改的字段' });
      }

      // 检查用户是否存在
      const check = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
      if (check.rowCount === 0) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }

      // 动态构建 UPDATE
      const fields = [];
      const values = [];
      let idx = 1;
      if (name) { fields.push(`name = $${idx++}`); values.push(name); }
      if (email) { fields.push(`email = $${idx++}`); values.push(email); }
      if (age !== undefined) { fields.push(`age = $${idx++}`); values.push(age); }
      values.push(id);

      const result = await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, age, created_at`,
        values
      );
      res.json({
        success: true,
        message: '用户更新成功',
        data: result.rows[0],
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ success: false, message: '该邮箱已被其他用户使用' });
      }
      console.error('更新用户失败:', err.message);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: 删除用户（需认证）
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
 *       404:
 *         description: 用户不存在
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('id 须为正整数'),
    validate,
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, name, email, age, created_at',
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }
      res.json({
        success: true,
        message: '用户删除成功',
        data: result.rows[0],
      });
    } catch (err) {
      console.error('删除用户失败:', err.message);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

module.exports = router;
