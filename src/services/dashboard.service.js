const pool = require('../db');

async function getStats() {
  const [totalRes, productRes, orderRes, roleRes, trendRes, logsRes, orderStatusRes] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM users'),
    pool.query('SELECT COUNT(*) AS count FROM products'),
    pool.query('SELECT COUNT(*) AS count FROM orders'),
    pool.query('SELECT role, COUNT(*) AS count FROM users GROUP BY role ORDER BY count DESC'),
    pool.query(`SELECT DATE(created_at) AS date, COUNT(*) AS count FROM users WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date`),
    pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10'),
    pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status'),
  ]);

  return {
    totalUsers: parseInt(totalRes.rows[0].count),
    totalProducts: parseInt(productRes.rows[0].count),
    totalOrders: parseInt(orderRes.rows[0].count),
    roleDistribution: roleRes.rows,
    newUserTrend: trendRes.rows,
    recentLogs: logsRes.rows,
    orderStatusDistribution: orderStatusRes.rows,
  };
}

module.exports = { getStats };
