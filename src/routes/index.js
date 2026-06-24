const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const auditLogsRoutes = require('./auditLogs.routes');
const dictRoutes = require('./dict.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/', dictRoutes);  // /dict-types, /dict/:code

module.exports = router;
