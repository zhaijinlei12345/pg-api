const express = require('express');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const orderController = require('../controllers/order.controller');
const { ROLES } = require('../constants');

const router = express.Router();

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     tags: [Orders]
 *     summary: 订单列表
 */
router.get('/', [
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 100 }),
  query('status').optional({ values: 'falsy' }).isString(),
  validate,
], orderController.list);

router.get('/:id', orderController.getById);

router.post('/', authenticate, requireRole(ROLES.ADMIN, ROLES.LEADER), [
  body('order_no').notEmpty(),
  body('customer_name').notEmpty(),
  body('total_amount').isFloat({ min: 0 }),
  validate,
], orderController.create);

router.put('/:id/status', authenticate, requireRole(ROLES.ADMIN, ROLES.LEADER), [
  body('status').notEmpty(),
], orderController.updateStatus);

router.delete('/:id', authenticate, requireRole(ROLES.ADMIN), orderController.remove);

module.exports = router;
