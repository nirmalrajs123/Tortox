const { pool } = require('../config/db');

// @desc    Get all A+ content for a product
// @route   GET /api/aplus/:productId
const getAPlusContent = async (req, res) => {
    const { productId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM aplus_contents WHERE product_id = $1 ORDER BY order_index ASC',
            [productId]
        );
        // Postgres JSONB returns as native object/array, so we can send directly
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error(`[APLUS] FETCH_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
};

// @desc    Add A+ content row
// @route   POST /api/aplus
const addAPlusContent = async (req, res) => {
    const { product_id } = req.body;
    const mediaFiles = req.files || [];
    const image_paths = mediaFiles.map(file => `/uploads/${file.filename}`);

    try {
        const result = await pool.query(
            'INSERT INTO aplus_contents (product_id, image_paths) VALUES ($1, $2::jsonb) RETURNING *',
            [product_id, JSON.stringify(image_paths)]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(`[APLUS] ADD_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
};

// @desc    Update A+ content row
// @route   PUT /api/aplus/:id
const updateAPlusContent = async (req, res) => {
    const { id } = req.params;
    const { image_paths } = req.body;

    try {
        const result = await pool.query(
            'UPDATE aplus_contents SET image_paths = $1::jsonb WHERE id = $2 RETURNING *',
            [typeof image_paths === 'string' ? image_paths : JSON.stringify(image_paths), id]
        );
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(`[APLUS] UPDATE_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
};

// @desc    Delete A+ content row
// @route   DELETE /api/aplus/:id
const deleteAPlusContent = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM aplus_contents WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: 'A+ Content row removed' });
    } catch (err) {
        console.error(`[APLUS] DELETE_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
};

module.exports = {
    getAPlusContent,
    addAPlusContent,
    updateAPlusContent,
    deleteAPlusContent
};
