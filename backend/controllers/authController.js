const { pool } = require('../config/db');

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Login successful', data: { email: result.rows[0].email, role: result.rows[0].role } });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Database Error: ' + error.message });
    } finally {
        client.release();
    }
};

module.exports = { loginUser };
