const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

// 记录所有 SQL 查询
pool.on('query', (query) => {
  const sql = query.text.replace(/\s+/g, ' ').trim();
  const params = query.values ? ` ${JSON.stringify(query.values)}` : '';
  console.log(`  📦 SQL: ${sql}${params}`);
});

pool.on('error', (err) => {
  console.error('  ❌ 数据库连接池错误:', err.message);
});

module.exports = pool;
