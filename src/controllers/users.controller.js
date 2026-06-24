const usersService = require('../services/users.service');
const { success, paginated } = require('../utils/response');
const { ROLES } = require('../constants');

async function list(req, res, next) {
  try {
    const result = await usersService.list(req.query);
    return paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await usersService.getById(Number(id));
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, age, role } = req.body;
    // 只有 admin 能指定角色
    const userRole = (req.user.role === ROLES.ADMIN && role) ? role : ROLES.USER;
    const user = await usersService.create(
      { name, email, age, role: userRole },
      req.user.id,
      req.user.email
    );
    return success(res, user, '用户创建成功', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, age, role } = req.body;

    // 非 admin 不能改角色
    if (role && req.user.role !== ROLES.ADMIN) {
      delete req.body.role;
    }

    const user = await usersService.update(
      Number(id),
      { name, email, age, role: req.user.role === ROLES.ADMIN ? role : undefined },
      req.user.id,
      req.user.email,
      req.user.role
    );
    return success(res, user, '用户更新成功');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const user = await usersService.remove(Number(id), req.user.id, req.user.email);
    return success(res, user, '用户删除成功');
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
