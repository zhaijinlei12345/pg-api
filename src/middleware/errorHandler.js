const { AppError } = require('../errors/AppError');

/**
 * 全局错误处理中间件（4 参数签名）
 * 捕获所有 throw / next(err) 传递的错误
 */
function errorHandler(err, _req, res, _next) {
  // 1. 预期内的操作错误（AppError 子类）
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 2. PostgreSQL 唯一约束冲突
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: '该数据已存在',
    });
  }

  // 3. 未预期的错误
  console.error('未捕获错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
  });
}

module.exports = errorHandler;
