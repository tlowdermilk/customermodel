const mysql = require('mysql2/promise');
const fs = require('fs');

// Database connection pool
let pool = null;

/**
 * Get or create the MySQL connection pool
 */
function getPool() {
  if (pool) {
    return pool;
  }

  const ssl = process.env.DB_SSL === 'true'
    ? {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
        ...(process.env.DB_SSL_CA
          ? { ca: fs.readFileSync(process.env.DB_SSL_CA, 'utf8') }
          : {}),
      }
    : undefined;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl,
  });

  return pool;
}

/**
 * Execute a query
 */
async function query(sql, params = []) {
  const pool = getPool();
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Get a connection from the pool for transactions
 */
async function getConnection() {
  const pool = getPool();
  return await pool.getConnection();
}

/**
 * Helper to convert binary UUIDs to readable strings in results
 */
function convertBinaryIds(rows, idFields = ['id']) {
  if (!rows || rows.length === 0) return rows;
  
  return rows.map(row => {
    const converted = { ...row };
    idFields.forEach(field => {
      if (converted[field] && Buffer.isBuffer(converted[field])) {
        // Convert binary UUID to string format
        const hex = converted[field].toString('hex');
        converted[field] = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }
    });
    return converted;
  });
}

module.exports = {
  query,
  getConnection,
  getPool,
  convertBinaryIds
};
