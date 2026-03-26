const { pool } = require('./config/db');
const fs = require('fs');

async function run() {
    const client = await pool.connect();
    try {
        console.log('--- Altering Table ---');
        await client.query('ALTER TABLE variant_images ADD COLUMN IF NOT EXISTS order_idd INTEGER DEFAULT 0');
        
        console.log('\n--- Selecting from variant_images ---');
        const res = await client.query('SELECT * FROM variant_images ORDER BY id ASC');
        
        let md = '# Variant Images\n\n| id | product_id | variant_id | image_url | order_idd |\n|---|---|---|---|---|\n';
        res.rows.forEach(r => {
            md += `| ${r.id} | ${r.product_id} | ${r.variant_id} | ${r.image_url} | ${r.order_idd} |\n`;
        });
        
        fs.writeFileSync('output.md', md);
        console.log('Saved output to output.md');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

run();
