const { pool } = require('../config/db');

// @desc    Get all active categories
// @route   GET /api/categories
const getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorys WHERE is_deleted = false ORDER BY parent_id, id ASC');
        console.log(`[STITCH_CAT] FETCH_ACTIVE_MANIFEST: COUNT=${result.rows.length}`);
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error(`[STITCH_CAT] FETCH_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

// @desc    Add or Reactivate a category
// @route   POST /api/categories
const addCategory = async (req, res) => {
    let { parent_id, category_name } = req.body;
    console.log(`[STITCH_CAT] ADD_SIGNAL: NAME="${category_name}" PARENT=${parent_id}`);

    if (!category_name || !category_name.trim()) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    category_name = category_name.trim();

    try {
        // 🛡️ Atomic Manifest Adoption (Industrial Upsert)
        const result = await pool.query(`
            INSERT INTO categorys (parent_id, category_name) 
            VALUES ($1, $2)
            ON CONFLICT (LOWER(TRIM(category_name))) 
            DO UPDATE SET is_deleted = false, parent_id = EXCLUDED.parent_id, category_name = EXCLUDED.category_name
            RETURNING *`,
            [parseInt(parent_id) || 0, category_name]
        );
        console.log(`[STITCH_CAT] ADD_OK: ID=${result.rows[0].id} RE-ACTIVATED=${result.rows[0].is_deleted === false}`);
        res.status(201).json({ success: true, message: 'Category Manifest Synced!', data: result.rows[0] });
    } catch (err) {
        console.error(`[STITCH_CAT] ADD_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
    const { id } = req.params;
    let { parent_id, category_name } = req.body;
    if (category_name) category_name = category_name.trim();
    console.log(`[STITCH_CAT] UPDATE_SIGNAL: ID=${id} NAME="${category_name}"`);

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
        console.error(`[STITCH_CAT] UPDATE_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

// @desc    Soft-Delete a category
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    console.log(`[STITCH_CAT] DELETE_PULSE: ID=${id}`);

    try {
        // 🔄 Sync both flags for legacy and manifest compatibility
        const result = await pool.query('UPDATE categorys SET is_deleted = true, is_delete = true WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            console.log(`[STITCH_CAT] DELETE_FAIL: ID=${id} (NOT_FOUND)`);
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        console.log(`[STITCH_CAT] DELETE_OK: ID=${id} (SOFT_DELETED_TRUE)`);
        res.status(200).json({ success: true, message: 'Category manifest moved to bin.' });
    } catch (err) {
        console.error(`[STITCH_CAT] DELETE_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

module.exports = {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};
