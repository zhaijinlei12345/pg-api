const authService = require('../services/auth.service');
const { success } = require('../utils/response');

async function register(req, res, next) {
  try {
    const { name, email, password, age } = req.body;
    const result = await authService.register(name, email, password, age);
    return success(res, result, '注册成功', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return success(res, result, '登录成功');
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const result = await authService.getMe(req.user.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
