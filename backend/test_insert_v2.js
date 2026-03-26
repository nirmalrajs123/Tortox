const { pool } = require('./config/db');

async function testInsert() {
    try {
        console.log('Testing category insert...');
        try {
            const res = await pool.query(
                'INSERT INTO categorys (parent_id, category_name) VALUES ($1, $2) RETURNING *',
                [0, 'Test Category ' + Date.now()]
            );
            console.log('Category inserted:', res.rows[0]);
        } catch (err) {
            console.error('Category error:', err.message);
            if (err.stack) console.error(err.stack);
        }

        console.log('Testing spec_label insert...');
        try {
            const res = await pool.query(
                'INSERT INTO spec_label (category_id, spec_label, spec_options) VALUES ($1, $2, $3) RETURNING *',
                [1, 'Test Label', 'Option1,Option2']
            );
            console.log('Spec label inserted:', res.rows[0]);
        } catch (err) {
            console.error('Spec label error:', err.message);
            if (err.stack) console.error(err.stack);
        }

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await pool.end();
    }
}

testInsert();
