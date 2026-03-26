const { pool } = require('./config/db');

async function inspectTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', JSON.stringify(res.rows.map(r => r.table_name)));

        const categorysRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'categorys'
        `);
        console.log('Categorys Columns:', JSON.stringify(categorysRes.rows));

        const specLabelRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'spec_label'
        `);
        console.log('Spec Label Columns:', JSON.stringify(specLabelRes.rows));

    } catch (err) {
        console.error('Error inspecting tables:', err);
    } finally {
        await pool.end();
    }
}

inspectTables();
