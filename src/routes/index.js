const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const auditLogsRoutes = require('./auditLogs.routes');
const dictRoutes = require('./dict.routes');
const dashboardRoutes = require('./dashboard.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/', dictRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
