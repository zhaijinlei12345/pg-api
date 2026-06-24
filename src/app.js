const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('./docs/swagger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  // ---------- 全局中间件 ----------
  app.use(cors());
  app.use(morgan(':method :url :status :response-time ms'));
  app.use(express.json());

  // ---------- Swagger 文档 ----------
  const swaggerSpec = swaggerJsdoc({
    definition: swaggerDefinition,
    apis: ['./src/routes/*.js'],
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

  // ---------- 健康检查 ----------
  app.get('/', (_req, res) => {
    res.json({
      message: 'pg-api is running',
      docs: '/api-docs',
      spec: '/api-docs.json',
    });
  });

  // ---------- API v1 ----------
  app.use('/api/v1', routes);

  // 向后兼容：旧 /api/* 重定向到 v1
  app.use('/api', (_req, res) => {
    res.status(301).json({ message: '请使用 /api/v1', docs: '/api-docs' });
  });

  // ---------- 404 ----------
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: '接口不存在' });
  });

  // ---------- 全局错误处理（必须最后） ----------
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
