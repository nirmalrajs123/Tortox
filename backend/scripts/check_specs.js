const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
});

async function check() {
    console.log('--- CHECKING SPECS FOR PRODUCT 50 (BX600) ---');
    const res = await pool.query('SELECT * FROM specifications WHERE product_id = 50');
    console.log('Count:', res.rows.length);
    console.log('Rows:', res.rows);
    process.exit(0);
}
check();
