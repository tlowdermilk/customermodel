const mysql = require('mysql2/promise');
const fs = require('fs');
const keyVault = require('./keyVault');

// Database connection pool
let pool = null;
let poolInitialized = false;

/**
 * Get or create the MySQL connection pool
 * Loads credentials from Key Vault (production) or environment variables (local)
 */
async function initializePool() {
  if (pool && poolInitialized) {
    return pool;
  }

  try {
    // Load database configuration from Key Vault (if available) or environment variables
    const config = await keyVault.loadDatabaseConfig();

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
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl,
    });

    poolInitialized = true;
    console.log('Database pool initialized successfully');
    return pool;
  } catch (error) {
    console.error('Failed to initialize database pool:', error);
    throw error;
  }
}

/**
 * Get or create the MySQL connection pool
 */
async function getPool() {
  if (pool && poolInitialized) {
    return pool;
  }

  return await initializePool();
}

/**
 * Execute a query
 */
async function query(sql, params = []) {
  const pool = await getPool();
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Get a connection from the pool for transactions
 */
async function getConnection() {
  const pool = await getPool();
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
