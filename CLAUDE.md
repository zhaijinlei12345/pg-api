# pg-api

用户管理系统后端，Express + PostgreSQL。

## 启动
```bash
cd ~/zhaijinlei/pg-api
npm start    # http://localhost:3000
```

## 技术栈
- Express 5 + Node.js
- PostgreSQL 16 (Homebrew, 用户 zhaijinlei, 无密码)
- JWT 认证 (jsonwebtoken + bcryptjs)
- express-validator (参数校验)
- Morgan (HTTP 日志)
- Swagger (API 文档: http://localhost:3000/api-docs)

## 项目结构
```
index.js                     # 入口
src/
├── config/index.js          # 集中式配置
├── constants/index.js       # 常量 (ROLES, ALLOWED_SORT 等)
├── db.js                    # pg Pool 连接
├── app.js                   # Express 工厂函数
├── errors/AppError.js       # 自定义错误类 (NotFound/Unauthorized/Forbidden/Conflict)
├── middleware/
│   ├── auth.js              # JWT 认证中间件
│   ├── errorHandler.js      # 全局错误处理
│   ├── requireRole.js       # 角色权限中间件
│   └── validate.js          # express-validator 校验处理
├── routes/
│   ├── index.js             # 路由聚合器 (统一挂载 /api/v1)
│   ├── auth.routes.js       # POST /api/v1/auth/register, /login, GET /me
│   ├── users.routes.js      # CRUD /api/v1/users
│   └── auditLogs.routes.js  # GET /api/v1/audit-logs
├── controllers/             # 请求/响应适配层 (薄层)
│   ├── auth.controller.js
│   ├── users.controller.js
│   └── auditLogs.controller.js
├── services/                # 业务逻辑 + SQL
│   ├── auth.service.js
│   ├── users.service.js
│   └── auditLog.service.js
├── utils/
│   ├── jwt.js               # signToken / verifyToken
│   └── response.js          # success() / paginated()
└── docs/swagger.js          # Swagger 配置
```

## 数据库
- 库名: testdb
- 用户: zhaijinlei
- 端口: 5432
- users 表: id, name, email, age, password, role, created_at
- audit_logs 表: id, user_id, user_name, action, target_type, target_id, details, created_at

## API 接口 (v1)
| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /api/v1/auth/register | 否 | 注册 |
| POST | /api/v1/auth/login | 否 | 登录 |
| GET | /api/v1/auth/me | 是 | 当前用户 |
| GET | /api/v1/users | 否 | 列表(分页/搜索/排序) |
| GET | /api/v1/users/:id | 否 | 详情 |
| POST | /api/v1/users | admin/leader | 新增 |
| PUT | /api/v1/users/:id | admin/leader | 修改 |
| DELETE | /api/v1/users/:id | admin | 删除 |
| GET | /api/v1/audit-logs | admin | 操作日志 |

旧 /api/* 请求返回 301 重定向到 /api/v1/*。

## 拓展指南
- **新增 CRUD**: 复制 services → controller → routes 模板，routes/index.js 加一行
- **新增 v2 API**: 创建 routes/v2/，app.js 加一行 mount
- **切换数据库**: 只改 services 层

## Git
- 仓库: git@github.com:zhaijinlei12345/pg-api.git
- 主分支: main
- 当前分支: feature-api调整
