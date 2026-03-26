const { pool } = require('../config/db');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorys ORDER BY parent_id, id ASC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

// @desc    Add a new category
// @route   POST /api/categories
const addCategory = async (req, res) => {
    const { parent_id, category_name } = req.body;

    if (!category_name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO categorys (parent_id, category_name) VALUES ($1, $2) RETURNING *',
            [parseInt(parent_id) || 0, category_name]
        );
        res.status(201).json({ success: true, message: 'Category added!', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { parent_id, category_name } = req.body;

    try {
        const result = await pool.query(
            'UPDATE categorys SET parent_id = $1, category_name = $2 WHERE id = $3 RETURNING *',
            [parseInt(parent_id) || 0, category_name, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category updated!', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM categorys WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

module.exports = {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};
