const jwt = require('jsonwebtoken');

/**
 * JWT 认证中间件
 * 从 Authorization: Bearer <token> 中提取并验证 JWT
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: '令牌无效或已过期' });
  }
}

module.exports = { authenticate };
