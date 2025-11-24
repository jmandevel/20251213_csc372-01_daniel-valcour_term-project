require('dotenv').config();
const { Pool } = require('pg');

// connection pool for clients to connect to database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.exports = pool;