const express = require('express');
const { authenticate } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: 仪表盘统计数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户总数、角色分布、近7天趋势、最近操作
 */
router.get('/stats', authenticate, dashboardController.stats);

module.exports = router;
