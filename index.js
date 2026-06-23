require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = require('./src/docs/swagger');
const authRouter = require('./src/routes/auth');
const usersRouter = require('./src/routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== 全局中间件 ==========
app.use(cors());                       // 跨域
// HTTP 请求日志: 方法 路径 状态码 响应时间
app.use(morgan(':method :url :status :response-time ms'));
app.use(express.json());               // JSON 请求体解析

// ========== Swagger 文档 ==========
const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js'],         // 扫描路由文件中的 JSDoc 注释
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 提供 JSON 格式的 spec（方便导入 Postman 等工具）
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// ========== 路由 ==========
app.get('/', (req, res) => {
  res.json({
    message: 'pg-api is running',
    docs: `http://localhost:${PORT}/api-docs`,
    spec: `http://localhost:${PORT}/api-docs.json`,
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// ========== 404 ==========
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// ========== 全局错误处理 ==========
// Express 5 中，4 参数错误处理中间件仍可正常工作
app.use((err, req, res, next) => {
  console.error('未捕获错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 pg-api 启动成功: http://localhost:${PORT}`);
  console.log(`📖 API 文档:     http://localhost:${PORT}/api-docs`);
  console.log(`📋 接口列表:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/users`);
  console.log(`   GET    /api/users/:id`);
  console.log(`   POST   /api/users      [需认证]`);
  console.log(`   PUT    /api/users/:id   [需认证]`);
  console.log(`   DELETE /api/users/:id   [需认证]`);
});
