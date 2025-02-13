const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clinical_trials',
  password: 'Apple@01',
  port: 5432,
});

module.exports = pool;
