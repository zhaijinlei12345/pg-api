const express = require('express');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const productController = require('../controllers/product.controller');
const { ROLES } = require('../constants');

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     tags: [Products]
 *     summary: 商品列表（分页/搜索/筛选）
 */
router.get(
  '/',
  [
    query('page').optional({ values: 'falsy' }).isInt({ min: 1 }),
    query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 100 }),
    query('category').optional({ values: 'falsy' }).isString(),
    query('status').optional({ values: 'falsy' }).isIn(['active', 'inactive']),
    validate,
  ],
  productController.list
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: 商品详情
 */
router.get('/:id', productController.getById);

router.post(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.LEADER),
  [
    body('name').notEmpty().withMessage('商品名不能为空'),
    body('price').isFloat({ min: 0 }).withMessage('价格须大于0'),
    body('stock').optional().isInt({ min: 0 }),
    validate,
  ],
  productController.create
);

router.put(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.LEADER),
  productController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  productController.remove
);

module.exports = router;
