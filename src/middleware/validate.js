const { validationResult } = require('express-validator');

/**
 * 统一校验结果处理中间件
 * 配合 express-validator 的 check/body/query 等使用
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '参数校验失败',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { validate };
