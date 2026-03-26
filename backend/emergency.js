const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => res.json({ message: "API IS ALIVE" }));

app.post('/api/save-full-filter', async (req, res) => {
    const { category_id, filter_label, options = [] } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const labelRes = await client.query(
            `INSERT INTO filter_labels (category_id, filter_label) VALUES ($1, $2) RETURNING id`,
            [category_id, filter_label]
        );
        const labelId = labelRes.rows[0].id;
        for (const val of options) {
            if (val && val.toString().trim()) {
                await client.query(
                    `INSERT INTO filter_values (filter_label_id, filter_value) VALUES ($1, $2)`,
                    [labelId, val.toString().trim()]
                );
            }
        }
        await client.query('COMMIT');
        res.status(201).json({ success: true, message: 'Saved!' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
});

app.listen(5000, '127.0.0.1', () => console.log('EMERGENCY SERVER ON 5000'));
