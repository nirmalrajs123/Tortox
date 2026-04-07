const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', password: '2965', database: 'Tortox', host: 'localhost', port: 5432 });
async function check() {
  const res = await pool.query("SELECT * FROM product_details LIMIT 1");
  console.log("Columns:", Object.keys(res.rows[0]));
  process.exit();
}
check();
