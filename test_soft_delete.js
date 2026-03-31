const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function testSoftDelete() {
    console.log('--- STARTING HIGH-FIDELITY SOFT DELETE PROVE ---');
    try {
        // 1. ADD 'j'
        const addRes = await axios.post('http://localhost:5000/api/categories', { category_name: 'j', parent_id: 0 });
        const id = addRes.data.data.id;
        console.log(`[OK] ADDED 'j' WITH ID: ${id}`);

        // 2. SOFT DELETE 'j'
        await axios.delete(`http://localhost:5000/api/categories/${id}`);
        console.log(`[OK] SENT DELETE PULSE FOR ID: ${id}`);

        // 3. VERIFY IN DB
        const dbRes = await pool.query('SELECT * FROM categorys WHERE id = $1', [id]);
        if (dbRes.rows.length > 0) {
            console.log(`[SUCCESS] ROW PERSISTED IN DB: id=${dbRes.rows[0].id} is_delete=${dbRes.rows[0].is_delete}`);
        } else {
            console.error(`[FAILURE] ROW WAS PURGED FROM DB!`);
        }

    } catch (err) {
        console.error('[ERROR] SIGNAL FAILURE:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testSoftDelete();
