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
        console.log("Creating variants table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS variants (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                color TEXT,
                size TEXT,
                style TEXT
            )
        `);
        console.log("Variants table created.");

        console.log("Creating variant_images table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS variant_images (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                variant_id INTEGER NOT NULL,
                image_url TEXT NOT NULL
            )
        `);
        console.log("Variant_images table created.");

    } catch (err) {
        console.error("Create tables error:", err);
    } finally {
        await pool.end();
    }
}
run();
