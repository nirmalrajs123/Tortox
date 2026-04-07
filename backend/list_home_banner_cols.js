const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Tortox/backend/.env' });
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
async function list() {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'home_banner'");
    console.log(res.rows.map(r => r.column_name).join(', '));
    await pool.end();
}
list();
