const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const auditLogsRoutes = require('./auditLogs.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/audit-logs', auditLogsRoutes);

module.exports = router;
