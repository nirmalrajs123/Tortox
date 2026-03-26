const { pool } = require('./backend/config/db');

async function run() {
    const client = await pool.connect();
    try {
        console.log('--- Altering Table ---');
        await client.query('ALTER TABLE variant_images ADD COLUMN IF NOT EXISTS order_idd INTEGER DEFAULT 0');
        console.log('Column order_idd added or already exists.');

        console.log('\n--- Selecting from variant_images ---');
        const res = await client.query('SELECT * FROM variant_images ORDER BY id ASC');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

run();
