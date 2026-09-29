const mysql = require('mysql2/promise');
const path = require('path');
const { config } = require('dotenv');

config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gsilks_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  multipleStatements: false,
  decimalNumbers: true
});

async function testConnection() {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  return true;
}

module.exports = {
  pool,
  testConnection
};
