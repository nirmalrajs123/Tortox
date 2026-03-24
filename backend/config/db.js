const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Successfully connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // process.exit(-1); // 🛡️ Commented out to prevent server auto-shutdown on idle disconnects
});

const initializeDatabase = async () => {
    // 1. Create Products Table
    const createProductsQuery = `
        DROP TABLE IF EXISTS product_details;
        CREATE TABLE product_details (
            id SERIAL PRIMARY KEY,
            category_id INTEGER,
            modal TEXT,
            modal_name TEXT,
            product_name TEXT,
            product_features TEXT,
            product_description TEXT,
            mb_compat TEXT,
            cooler_compat TEXT,
            panel_type TEXT,
            installed_fans TEXT,
            installed_psu TEXT,
            price DECIMAL(10, 2),
            image TEXT,
            specs JSONB -- for detailed case dimensions or custom specs overlay flaws decently
        );
    `;

    // 2. Create Users Table for Dashboard CMS
    const createUsersQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            role VARCHAR(20) DEFAULT 'admin'
        );
    `;
    // 3. Create categorys Table for Dashboard CMS
    const createCategorysQuery = `
        CREATE TABLE IF NOT EXISTS categorys (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER DEFAULT 0,
    category_name TEXT NOT NULL
    );
    `;
    // 4. Create specification Table for Dashboard CMS
    const createSpecificationsQuery = `
        CREATE TABLE IF NOT EXISTS specifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER DEFAULT 0,
    specification_name TEXT NOT NULL,
    specification_value TEXT NOT NULL,
    specification_deleted BOOLEAN DEFAULT false
    );
    `;



    // 6. Create variants Table for Dashboard CMS
    const createVariantsQuery = `
        CREATE TABLE IF NOT EXISTS variants (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            color TEXT,
            size TEXT,
            style TEXT
        );
    `;

    // 7. Create variant_images Table for Dashboard CMS
    const createVariantImagesQuery = `
        CREATE TABLE IF NOT EXISTS variant_images (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            variant_id INTEGER NOT NULL,
            image_url TEXT NOT NULL
        );
    `;
    // 8. Create spec_label Table for Dashboard CMS
    const createSpecLabelQuery = `
        CREATE TABLE IF NOT EXISTS spec_label (
            id SERIAL PRIMARY KEY,
            category_id INTEGER NOT NULL,
            spec_label TEXT NOT NULL,
            is_deleted BOOLEAN DEFAULT false
        );
    `;

    // 9. Create features Table for Dashboard CMS
    const createFeaturesQuery = `
        CREATE TABLE IF NOT EXISTS features (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            features TEXT NOT NULL,
            is_deleted BOOLEAN DEFAULT false
        );
    `;

    try {

        await pool.query(createProductsQuery);
        await pool.query(createUsersQuery);
        await pool.query(createCategorysQuery);
        await pool.query(createSpecificationsQuery);
        await pool.query(createVariantsQuery);
        await pool.query(createVariantImagesQuery);
        await pool.query(createSpecLabelQuery);
        await pool.query(createFeaturesQuery);

        // Seeding Products


        // Seeding Admin User for CMS
        const checkUsers = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(checkUsers.rows[0].count) === 0) {
            console.log('Seeding admin user config triggers setup adequately properly setup...');
            const seedUserQuery = `
                INSERT INTO users (email, password, role) VALUES
                ('admin@tortox.com', '1234', 'admin');
            `;
            await pool.query(seedUserQuery);
            console.log('Database Admin users support seeded successfully.');
        }

    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
};

module.exports = {
    pool,
    initializeDatabase
};
