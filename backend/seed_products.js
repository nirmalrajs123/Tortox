const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function run() {
    try {
        await pool.query(`INSERT INTO product_details (category_id, modal, modal_name, product_name, product_features, product_description, mb_compat, price, specs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
            1, 'CAB-TORTOX-V1', 'Tortox Gaming Tower', 'Core Engine Pro Case', 'ARGB Control, Tempered Glass', 'Master class case designed for overclocking and absolute beauty.', 'ATX, Micro-ATX', 129.99, JSON.stringify({ MaxFans: '6', MaxGpu: '340mm', CaseMaterial: 'Aluminum' })
        ]);
        console.log("Product seeded successfully!");
        pool.end();
    } catch (e) {
        console.error("Seed error:", e.message);
        pool.end();
    }
}
run();
