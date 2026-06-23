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
index.js               # 入口
src/
├── db.js              # pg Pool 连接 (testdb), 含 SQL 查询日志
├── routes/
│   ├── auth.js        # POST /api/auth/register, /api/auth/login
│   └── users.js       # CRUD /api/users, 分页/搜索/排序
├── middleware/
│   ├── auth.js        # JWT 认证中间件
│   └── validate.js    # express-validator 校验处理
└── docs/swagger.js    # Swagger 配置
```

## 数据库
- 库名: testdb
- 用户: zhaijinlei
- 端口: 5432
- users 表: id, name, email, age, password, created_at

## API 接口
| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /api/auth/register | 否 | 注册 |
| POST | /api/auth/login | 否 | 登录 |
| GET | /api/users | 否 | 列表(分页/搜索/排序) |
| POST | /api/users | 是 | 新增 |
| PUT | /api/users/:id | 是 | 修改 |
| DELETE | /api/users/:id | 是 | 删除 |

搜索参数: search, searchField (all/id/name/email/age), sort, order, page, limit

## Git
- 仓库: git@github.com:zhaijinlei12345/pg-api.git
- 主分支: main
- 当前分支: feature-api调整
