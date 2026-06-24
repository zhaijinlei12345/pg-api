const ROLES = {
  ADMIN: 'admin',
  LEADER: 'leader',
  USER: 'user',
};

const ALLOWED_USER_SORT_FIELDS = ['id', 'name', 'email', 'age', 'created_at'];

const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

// 权限点定义（细粒度）
const PERMISSIONS = {
  DASHBOARD: { VIEW: 'dashboard.view' },
  USERS:     { READ: 'users.read', WRITE: 'users.write', DELETE: 'users.delete' },
  PRODUCTS:  { READ: 'products.read', WRITE: 'products.write', DELETE: 'products.delete' },
  ORDERS:    { READ: 'orders.read', MANAGE: 'orders.manage', DELETE: 'orders.delete' },
  AUDIT:     { READ: 'audit.read' },
  DICT:      { MANAGE: 'dict.manage' },
};

// 角色 → 权限映射（'*' 表示所有权限）
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.LEADER]: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.USERS.READ, PERMISSIONS.USERS.WRITE,
    PERMISSIONS.PRODUCTS.READ, PERMISSIONS.PRODUCTS.WRITE,
    PERMISSIONS.ORDERS.READ, PERMISSIONS.ORDERS.MANAGE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.DASHBOARD.VIEW,
  ],
};

function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

module.exports = { ROLES, PERMISSIONS, ROLE_PERMISSIONS, hasPermission, ALLOWED_USER_SORT_FIELDS, AUDIT_ACTIONS };
