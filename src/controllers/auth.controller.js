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

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
    return success(res, result, '密码修改成功');
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, age } = req.body;
    const result = await authService.updateProfile(req.user.id, { name, email, age });
    return success(res, result, '个人信息更新成功');
  } catch (err) {
    next(err);
  }
}

async function getPermissions(req, res, next) {
  try {
    const result = authService.getPermissions(req.user.role);
    return success(res, { role: req.user.role, permissions: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, changePassword, updateProfile, getPermissions };
