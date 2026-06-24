/**
 * 应用级错误基类
 * isOperational = true 表示预期内的错误（如 404/401），由 errorHandler 统一处理
 * isOperational = false 表示编程 bug，应 crash 进程
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '未认证') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = '权限不足') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = '数据冲突') {
    super(message, 409);
  }
}

class ValidationError extends AppError {
  constructor(message = '参数校验失败') {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
};
