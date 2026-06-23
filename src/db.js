const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'testdb',
  user: process.env.DB_USER || 'zhaijinlei',
  password: process.env.DB_PASSWORD || '',
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
