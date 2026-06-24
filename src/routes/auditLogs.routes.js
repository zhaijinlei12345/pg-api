const express = require('express');
const { query } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const auditLogsController = require('../controllers/auditLogs.controller');
const { ROLES } = require('../constants');

const router = express.Router();

/**
 * @swagger
 * /api/v1/audit-logs:
 *   get:
 *     tags: [AuditLogs]
 *     summary: 查询操作日志（仅管理员）
 *     security:
 *       - bearerAuth: []
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
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *     responses:
 *       200:
 *         description: 操作日志列表
 *       403:
 *         description: 权限不足
 */
router.get(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page 须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit 须在 1-100 之间'),
    query('action').optional().isIn(['CREATE', 'UPDATE', 'DELETE']).withMessage('action 不合法'),
    validate,
  ],
  auditLogsController.list
);

module.exports = router;
