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

module.exports = { ROLES, ALLOWED_USER_SORT_FIELDS, AUDIT_ACTIONS };
