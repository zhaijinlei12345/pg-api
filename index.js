const config = require('./src/config');
const createApp = require('./src/app');

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 pg-api 启动成功: http://localhost:${config.port}`);
  console.log(`📖 API 文档:     http://localhost:${config.port}/api-docs`);
  console.log(`📋 接口列表:`);
  console.log(`   POST   /api/v1/auth/register`);
  console.log(`   POST   /api/v1/auth/login`);
  console.log(`   GET    /api/v1/auth/me`);
  console.log(`   GET    /api/v1/users`);
  console.log(`   GET    /api/v1/users/:id`);
  console.log(`   POST   /api/v1/users      [需认证]`);
  console.log(`   PUT    /api/v1/users/:id   [需认证]`);
  console.log(`   DELETE /api/v1/users/:id   [需认证+管理员]`);
  console.log(`   GET    /api/v1/audit-logs  [需认证+管理员]`);
});
