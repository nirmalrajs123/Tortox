const { pool } = require('./config/db');

async function test() {
    const res = await pool.query('SELECT * FROM product_details;');
    console.log(`Products in DB: ${res.rowCount}`);
    pool.end();
}
test();
