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
        const tables = res.rows.map(r => r.table_name);
        console.log("Tables:", tables.join(', '));
        
        if (!tables.includes('additional_downloads')) {
            console.log("Creating table additional_downloads...");
            await pool.query(`
                CREATE TABLE IF NOT EXISTS additional_downloads (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER NOT NULL,
                    download_path TEXT NOT NULL,
                    download_label TEXT,
                    is_deleted BOOLEAN DEFAULT false,
                    download_type TEXT DEFAULT 'general' -- 'general' or 'technical'
                )
            `);
        } else {
            // Check if download_type exists
            const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'additional_downloads'");
            const colNames = cols.rows.map(r => r.column_name);
            if (!colNames.includes('download_type')) {
                console.log("Adding download_type column to additional_downloads...");
                await pool.query("ALTER TABLE additional_downloads ADD COLUMN download_type TEXT DEFAULT 'general'");
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
run();
