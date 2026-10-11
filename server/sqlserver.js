const path = require('path');
const dotenv = require('dotenv');
const sql = require('mssql');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

let poolPromise;

function asBoolean(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function connectionConfig() {
  const rawServer = process.env.DB_SERVER || 'localhost';
  const namedInstance = process.env.DB_INSTANCE || '';
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: rawServer === '(local)' || rawServer === '.' ? 'localhost' : rawServer,
    database: process.env.DB_NAME || 'bansacdb',
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
      encrypt: asBoolean(process.env.DB_ENCRYPT, false),
      trustServerCertificate: asBoolean(process.env.DB_TRUST_SERVER_CERTIFICATE, true),
      enableArithAbort: true
    },
    connectionTimeout: 15000,
    requestTimeout: 30000
  };

  if (process.env.DB_PORT) config.port = Number(process.env.DB_PORT);
  else if (namedInstance) config.options.instanceName = namedInstance;

  if (!config.user || !config.password) {
    throw new Error('Thiếu DB_USER hoặc DB_PASSWORD trong file .env.');
  }
  return config;
}

function getPool() {
  if (!poolPromise) {
    const pool = new sql.ConnectionPool(connectionConfig());
    poolPromise = pool.connect().catch((error) => {
      poolPromise = null;
      throw error;
    });
  }
  return poolPromise;
}

async function verifyConnection() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      DB_NAME() AS databaseName,
      @@SERVERNAME AS serverName,
      (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) AS tableCount,
      CASE WHEN OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
             AND OBJECT_ID(N'dbo.Products', N'U') IS NOT NULL
             AND OBJECT_ID(N'dbo.Orders', N'U') IS NOT NULL
           THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS schemaReady;
  `);
  return result.recordset[0];
}

async function closePool() {
  if (!poolPromise) return;
  const pool = await poolPromise;
  poolPromise = null;
  await pool.close();
}

module.exports = { sql, getPool, verifyConnection, closePool, connectionConfig };
