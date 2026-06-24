const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../errors/AppError');

/**
 * JWT 认证中间件
 * 从 Authorization: Bearer <token> 中提取并验证 JWT
 */
function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('未提供认证令牌'));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyToken(token); // { id, email, role, iat, exp }
    next();
  } catch (_err) {
    next(new UnauthorizedError('令牌无效或已过期'));
  }
}

module.exports = { authenticate };
