const { pool } = require('./config/db');

async function fixDatabase() {
    try {
        console.log('Fetching detailed table info...');
        // 1. Check spec_label for spec_options
        const specLabelCol = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'spec_label' AND column_name = 'spec_options'
        `);
        if (specLabelCol.rowCount === 0) {
            console.log('Adding spec_options to spec_label...');
            await pool.query('ALTER TABLE spec_label ADD COLUMN spec_options TEXT');
        } else {
            console.log('spec_options already exists in spec_label');
        }

        // 2. Check categorys id default
        const categorysIdDefault = await pool.query(`
            SELECT column_default FROM information_schema.columns 
            WHERE table_name = 'categorys' AND column_name = 'id'
        `);
        console.log('Categorys id default:', categorysIdDefault.rows[0]?.column_default);

        if (!categorysIdDefault.rows[0]?.column_default || !categorysIdDefault.rows[0].column_default.includes('nextval')) {
            console.log('Fixing categorys id SERIAL...');
            // Need to create sequence if not exists
            await pool.query('CREATE SEQUENCE IF NOT EXISTS categorys_id_seq');
            await pool.query("ALTER TABLE categorys ALTER COLUMN id SET DEFAULT nextval('categorys_id_seq'::regclass)");
            await pool.query('SELECT setval(\'categorys_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM categorys))');
        }

        // 3. Check specifications table for spec_label_id
        const specsCols = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'specifications'
        `);
        const labelsColExists = specsCols.rows.some(c => c.column_name === 'spec_label_id');
        if (!labelsColExists) {
            console.log('Adding spec_label_id to specifications...');
            await pool.query('ALTER TABLE specifications ADD COLUMN spec_label_id INTEGER');
        }
        
        const orderIdColExists = specsCols.rows.some(c => c.column_name === 'order_id');
        if (!orderIdColExists) {
            console.log('Adding order_id to specifications...');
            await pool.query('ALTER TABLE specifications ADD COLUMN order_id INTEGER');
        }

        console.log('Migration finished successfully.');

    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await pool.end();
    }
}

fixDatabase();
