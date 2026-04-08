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
    const alterProductImagesQuery = `
        ALTER TABLE product_images ADD COLUMN IF NOT EXISTS image_type TEXT DEFAULT 'gallery';
        ALTER TABLE product_images ADD COLUMN IF NOT EXISTS hover_path TEXT;
    `;
    await pool.query(alterProductImagesQuery);

    // 1. Create Products Table
    const createProductsQuery = `
        CREATE TABLE IF NOT EXISTS product_details (
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
            hover_image TEXT,
            alt_text TEXT,
            meta_tags TEXT,
            specs JSONB,
            FOREIGN KEY (category_id) REFERENCES categorys(id)
        );
    `;

    const alterTableQuery = `
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS hover_image TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS alt_text TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS meta_tags TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS product_name TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS modal_name TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS product_features TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS product_description TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS mb_compat TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS cooler_compat TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS panel_type TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS installed_fans TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS installed_psu TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS image TEXT;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS specs JSONB;
        ALTER TABLE product_details ADD COLUMN IF NOT EXISTS aplus_images JSONB;
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
            variant_id INTEGER DEFAULT 0,
            category_id INTEGER DEFAULT 0,
            specification_name TEXT NOT NULL,
            specification_value TEXT NOT NULL,
            order_id INTEGER,
            spec_label_id INTEGER,
            foreign key (spec_label_id) references spec_label(id)
        );
    `;



    // 6. Create variants Table for Dashboard CMS
    const createVariantsQuery = `
        CREATE TABLE IF NOT EXISTS variants (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            color TEXT,
            size TEXT,
            style TEXT,
            description TEXT,
            model_name TEXT,
            product_name TEXT
        );
    `;

    // 7. Create variant_images Table for Dashboard CMS
    const createVariantImagesQuery = `
        CREATE TABLE IF NOT EXISTS variant_images (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            variant_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            order_idd INTEGER DEFAULT 0
        );
    `;
    // 8. Create spec_label Table for Dashboard CMS
    const createSpecLabelQuery = `
        CREATE TABLE IF NOT EXISTS spec_label (
            id SERIAL PRIMARY KEY,
            category_id INTEGER NOT NULL,
            spec_label TEXT NOT NULL,
            spec_options TEXT -- comma separated options
        );
    `;

    // 9. Create features Table for Dashboard CMS
    const createFeaturesQuery = `
        CREATE TABLE IF NOT EXISTS features (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            variant_id INTEGER DEFAULT 0,
            category_id INTEGER DEFAULT 0,
            features TEXT NOT NULL
        );
    `;

    // 10. Create product_images Table for Dashboard CMS
    const createProductImagesQuery = `
        CREATE TABLE IF NOT EXISTS product_images (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            image_path TEXT,
            hover_path TEXT,
            image_type TEXT DEFAULT 'gallery' -- 'main', 'hover', 'gallery'
        );
    `;

    // 11. Create filter_labels Table for Dashboard CMS
    const createFilterLabelsQuery = `
        CREATE TABLE IF NOT EXISTS filter_labels (
            id SERIAL PRIMARY KEY,
            category_id INTEGER NOT NULL,
            filter_label TEXT NOT NULL
        );
    `;

    // 13. Create filter_values Table for Dashboard CMS
    const createFilterValuesQuery = `
        CREATE TABLE IF NOT EXISTS filter_values (
            id SERIAL PRIMARY KEY,
            filter_label_id INTEGER NOT NULL,
            filter_value TEXT NOT NULL,
            FOREIGN KEY (filter_label_id) REFERENCES filter_labels(id)
        );
    `;

    // 12. Create product_filters Table for Dashboard CMS
    const createProductFiltersQuery = `
        CREATE TABLE IF NOT EXISTS product_filters (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            variant_id INTEGER DEFAULT 0,
            category_id INTEGER DEFAULT 0,
            filter_type_id INTEGER NOT NULL,
            filter_value TEXT NOT NULL,
            filter_value_id INTEGER,
            FOREIGN KEY (product_id) REFERENCES product_details(id),
            FOREIGN KEY (filter_type_id) REFERENCES filter_labels(id),
            FOREIGN KEY (filter_value_id) REFERENCES filter_values(id)
        );
    `;

    // 14. Create home_banner Table
    const createHomeBannerQuery = `
        CREATE TABLE IF NOT EXISTS home_banner (
            id SERIAL PRIMARY KEY,
            banner_text TEXT,
            banner_options JSONB DEFAULT '[]',
            media_path TEXT,
            media_type TEXT DEFAULT 'image',
            subtitle TEXT,
            description TEXT,
            button_text TEXT,
            title_prefix TEXT,
            title_highlight TEXT,
            title_suffix TEXT
        );
    `;

    const alterHomeBannerQuery = `
        ALTER TABLE home_banner ADD COLUMN IF NOT EXISTS banner_options JSONB DEFAULT '[]';
        ALTER TABLE home_banner ADD COLUMN IF NOT EXISTS subtitle TEXT;
        ALTER TABLE home_banner ADD COLUMN IF NOT EXISTS mobile_media_path TEXT;
        ALTER TABLE home_banner ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE home_banner ADD COLUMN IF NOT EXISTS button_text TEXT;
        ALTER TABLE home_banner ADD COLUMN IF NOT EXISTS title_prefix TEXT;
        ALTER TABLE home_banner ADD COLUMN IF NOT EXISTS title_highlight TEXT;
        ALTER TABLE home_banner ADD COLUMN IF NOT EXISTS title_suffix TEXT;
    `;

    try {
        await pool.query(createHomeBannerQuery);
        await pool.query(alterHomeBannerQuery);
        await pool.query(createProductsQuery);
        await pool.query(alterTableQuery);
        await pool.query(`ALTER TABLE spec_label ADD COLUMN IF NOT EXISTS spec_options TEXT;`);
        await pool.query(createUsersQuery);
        await pool.query(createCategorysQuery);
        await pool.query(`ALTER TABLE categorys ADD COLUMN IF NOT EXISTS category_image TEXT;`);

        // 15. Create aplus_contents Table
        const createAPlusContentsQuery = `
            CREATE TABLE IF NOT EXISTS aplus_contents (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                image_paths JSONB DEFAULT '[]',
                order_index INTEGER DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES product_details(id)
            );
        `;
        await pool.query(createAPlusContentsQuery);
        await pool.query(`ALTER TABLE aplus_contents ADD COLUMN IF NOT EXISTS mobile_media_path TEXT;`);

        await pool.query(createVariantImagesQuery);
        await pool.query(createSpecLabelQuery); // Must exist before specifications for FK
        await pool.query(createSpecificationsQuery);
        await pool.query(createVariantsQuery);
        await pool.query(createFeaturesQuery);
        await pool.query(createProductImagesQuery);
        await pool.query(createFilterLabelsQuery);
        await pool.query(createFilterValuesQuery);
        await pool.query(createProductFiltersQuery);

        // Explicitly patch FK to existing table instances since CREATE IF NOT EXISTS won't update schema
        try {
            await pool.query(`
                ALTER TABLE specifications 
                ADD CONSTRAINT fk_spec_label 
                FOREIGN KEY (spec_label_id) 
                REFERENCES spec_label(id);
            `);
        } catch (e) {
            // Constraint probably exists, silently ignore
        }

        // 🛠️ Alter tables for variant support trigger framing flawlessly flawless flawless flaws flawlessly
        await pool.query(`ALTER TABLE specifications ADD COLUMN IF NOT EXISTS variant_id INTEGER DEFAULT 0;`);
        await pool.query(`ALTER TABLE specifications ADD COLUMN IF NOT EXISTS category_id INTEGER DEFAULT 0;`);
        await pool.query(`ALTER TABLE features ADD COLUMN IF NOT EXISTS variant_id INTEGER DEFAULT 0;`);
        await pool.query(`ALTER TABLE features ADD COLUMN IF NOT EXISTS category_id INTEGER DEFAULT 0;`);
        await pool.query(`ALTER TABLE product_filters ADD COLUMN IF NOT EXISTS variant_id INTEGER DEFAULT 0;`);
        await pool.query(`ALTER TABLE product_filters ADD COLUMN IF NOT EXISTS category_id INTEGER DEFAULT 0;`);
        await pool.query(`ALTER TABLE product_filters ADD COLUMN IF NOT EXISTS filter_value_id INTEGER;`);
        await pool.query(`ALTER TABLE variants ADD COLUMN IF NOT EXISTS description TEXT;`);
        await pool.query(`ALTER TABLE variants ADD COLUMN IF NOT EXISTS model_name TEXT;`);
        await pool.query(`ALTER TABLE variants ADD COLUMN IF NOT EXISTS product_name TEXT;`);
        await pool.query(`ALTER TABLE product_images ALTER COLUMN image_path DROP NOT NULL;`);

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
