/**
 * Swagger / OpenAPI 配置
 * 访问路径：http://localhost:3000/api-docs
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'pg-api 接口文档',
    version: '1.0.0',
    description: '基于 Express + PostgreSQL 的 RESTful API，提供 users 表的 CRUD 及认证功能',
  },
  servers: [
    { url: 'http://localhost:3000/api/v1', description: 'API v1' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '登录/注册后获取的 JWT Token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: '张三' },
          email: { type: 'string', format: 'email', example: 'zhangsan@example.com' },
          age: { type: 'integer', example: 28 },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: '错误信息' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: '认证接口 — 注册 & 登录' },
    { name: 'Users', description: '用户 CRUD 接口' },
    { name: 'AuditLogs', description: '操作日志（仅管理员）' },
    { name: 'Dict', description: '数据字典 — 统一管理枚举值' },
  ],
};

module.exports = swaggerDefinition;
