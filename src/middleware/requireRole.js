const { ForbiddenError } = require('../errors/AppError');

/**
 * 角色权限中间件（需在 authenticate 之后使用）
 * @param  {...string} roles - 允许的角色列表
 * 用法: requireRole('admin') 或 requireRole('admin', 'leader')
 */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError(`权限不足，需要角色: ${roles.join(' 或 ')}`));
    }
    next();
  };
}

module.exports = { requireRole };
