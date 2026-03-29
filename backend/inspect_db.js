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
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("TABLES:", res.rows.map(r => r.table_name).join(', '));

    for (const t of res.rows) {
        const cols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${t.table_name}'`);
        console.log(`- ${t.table_name}: ${cols.rows.map(r => r.column_name).join(', ')}`);
    }
    await pool.end();
}
list();
