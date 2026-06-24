-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(200) NOT NULL UNIQUE,
  age        INT,
  password   VARCHAR(200),
  role       VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INT,
  user_name   VARCHAR(200),
  action      VARCHAR(20),
  target_type VARCHAR(50),
  target_id   INT,
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) DEFAULT 0,
  stock       INT DEFAULT 0,
  category    VARCHAR(50),
  image_url   VARCHAR(500),
  status      VARCHAR(20) DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  order_no       VARCHAR(30) NOT NULL UNIQUE,
  customer_name  VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  total_amount   DECIMAL(10,2) DEFAULT 0,
  status         VARCHAR(20) DEFAULT 'pending',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INT,
  product_name VARCHAR(200) NOT NULL,
  quantity     INT DEFAULT 1,
  unit_price   DECIMAL(10,2) NOT NULL,
  subtotal     DECIMAL(10,2) NOT NULL
);

-- 字典类型表
CREATE TABLE IF NOT EXISTS dict_types (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50) NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 字典条目表
CREATE TABLE IF NOT EXISTS dict_entries (
  id         SERIAL PRIMARY KEY,
  type_code  VARCHAR(50) NOT NULL REFERENCES dict_types(code) ON DELETE CASCADE,
  key        VARCHAR(50) NOT NULL,
  label      VARCHAR(100) NOT NULL,
  color      VARCHAR(20),
  sort_order INT DEFAULT 0,
  enabled    BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type_code, key)
);

-- ========== 种子数据 ==========

-- 角色字典
INSERT INTO dict_types (code, name, description) VALUES ('role', '角色', '用户角色')
  ON CONFLICT (code) DO NOTHING;
INSERT INTO dict_entries (type_code, key, label, color, sort_order) VALUES
  ('role', 'admin',  '管理员', 'purple', 1),
  ('role', 'leader', '组长',   'blue',   2),
  ('role', 'user',   '用户',   'default',3)
  ON CONFLICT (type_code, key) DO NOTHING;

-- 操作类型字典
INSERT INTO dict_types (code, name, description) VALUES ('audit_action', '操作类型', '审计日志操作分类')
  ON CONFLICT (code) DO NOTHING;
INSERT INTO dict_entries (type_code, key, label, color, sort_order) VALUES
  ('audit_action', 'CREATE', '创建', '#10b981', 1),
  ('audit_action', 'UPDATE', '更新', '#3b82f6', 2),
  ('audit_action', 'DELETE', '删除', '#ef4444', 3)
  ON CONFLICT (type_code, key) DO NOTHING;

-- 商品分类字典
INSERT INTO dict_types (code, name, description) VALUES ('product_category', '商品分类', '商品类别')
  ON CONFLICT (code) DO NOTHING;
INSERT INTO dict_entries (type_code, key, label, color, sort_order) VALUES
  ('product_category', 'electronics', '电子产品', '#3b82f6', 1),
  ('product_category', 'clothing',    '服装',     '#ec4899', 2),
  ('product_category', 'food',        '食品',     '#10b981', 3),
  ('product_category', 'other',       '其他',     '#6b7280', 4)
  ON CONFLICT (type_code, key) DO NOTHING;

-- 商品状态字典
INSERT INTO dict_types (code, name, description) VALUES ('product_status', '商品状态', '上架状态')
  ON CONFLICT (code) DO NOTHING;
INSERT INTO dict_entries (type_code, key, label, color, sort_order) VALUES
  ('product_status', 'active',   '上架', '#10b981', 1),
  ('product_status', 'inactive', '下架', '#ef4444', 2)
  ON CONFLICT (type_code, key) DO NOTHING;

-- 订单状态字典
INSERT INTO dict_types (code, name, description) VALUES ('order_status', '订单状态', '订单流程状态')
  ON CONFLICT (code) DO NOTHING;
INSERT INTO dict_entries (type_code, key, label, color, sort_order) VALUES
  ('order_status', 'pending',   '待支付', '#f59e0b', 1),
  ('order_status', 'paid',      '已支付', '#3b82f6', 2),
  ('order_status', 'shipped',   '已发货', '#8b5cf6', 3),
  ('order_status', 'completed', '已完成', '#10b981', 4),
  ('order_status', 'cancelled', '已取消', '#ef4444', 5)
  ON CONFLICT (type_code, key) DO NOTHING;

-- 种子管理员
INSERT INTO users (name, email, password, role) VALUES
  ('管理员', 'admin@admin.com', '$2b$10$V0v1AwU2vTQkPYi4rO8Q/.t3iKK5GPBJ7kjU4BdkKT0jvPgXos5JC', 'admin')
  ON CONFLICT (email) DO NOTHING;
-- 密码: 123456 (bcrypt hash)
