const { pool } = require('../config/db');

const query = async (statement, parameters = []) => {
  const [result] = await pool.query(statement, parameters);
  return result;
};

module.exports = { query, pool };