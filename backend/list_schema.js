const { Pool } = require('pg');
const pool = new Pool({ 
    user: 'postgres', 
    host: 'localhost', 
    database: 'Tortox', 
    password: '2965', 
    port: 5432 
});

async function run() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log("Tables:", res.rows.map(r => r.table_name).join(', '));
        
        for (const table of res.rows) {
            const cols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table.table_name}'`);
            console.log(`Table ${table.table_name}:`, cols.rows.map(r => r.column_name).join(', '));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
run();
