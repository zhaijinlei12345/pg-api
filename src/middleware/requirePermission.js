const { hasPermission } = require('../constants');
const { ForbiddenError } = require('../errors/AppError');

/**
 * 权限中间件（需在 authenticate 之后使用）
 * @param {string} permission - 权限点，如 'users.delete'
 * 用法: requirePermission('users.delete')
 */
function requirePermission(permission) {
  return (req, _res, next) => {
    if (!req.user || !hasPermission(req.user.role, permission)) {
      return next(new ForbiddenError(`需要权限: ${permission}`));
    }
    next();
  };
}

module.exports = { requirePermission };
