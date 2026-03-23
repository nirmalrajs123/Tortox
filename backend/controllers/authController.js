const { pool } = require('../config/db');

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        res.status(200).json({ success: true, message: 'Login successful', data: { email: result.rows[0].email, role: result.rows[0].role } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database Error: ' + error.message });
    }
};

module.exports = { loginUser };
