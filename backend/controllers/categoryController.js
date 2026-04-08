const { pool } = require('../config/db');

// @desc    Get all active categories
// @route   GET /api/categories
const getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorys ORDER BY parent_id, id ASC');
        const serverHost = `${req.protocol}://${req.get('host')}`;
        const data = result.rows.map(cat => ({
            ...cat,
            category_image: cat.category_image ? (cat.category_image.startsWith('http') ? cat.category_image : `${serverHost}${cat.category_image.startsWith('/') ? '' : '/'}${cat.category_image.trim()}`) : null
        }));
        console.log(`[STITCH_CAT] FETCH_ACTIVE_MANIFEST: COUNT=${result.rows.length}`);
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error(`[STITCH_CAT] FETCH_ERROR:`, err);
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
};

// @desc    Add or Reactivate a category
// @route   POST /api/categories
const addCategory = async (req, res) => {
    let { parent_id, category_name } = req.body;
    const mediaFile = req.files && req.files.length > 0 ? req.files[0] : null;
    let category_image = mediaFile ? `/uploads/${mediaFile.filename}` : null;

    console.log(`[STITCH_CAT] ADD_SIGNAL: NAME="${category_name}" PARENT=${parent_id}`);

    if (!category_name || !category_name.trim()) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    category_name = category_name.trim();

    try {
        // 🛡️ Atomic Manifest Adoption (Industrial Upsert)
        const result = await pool.query(`
            INSERT INTO categorys (parent_id, category_name, category_image) 
            VALUES ($1, $2, $3)
            ON CONFLICT (LOWER(TRIM(category_name))) 
            DO UPDATE SET parent_id = EXCLUDED.parent_id, category_name = EXCLUDED.category_name, category_image = EXCLUDED.category_image
            RETURNING *`,
            [parseInt(parent_id) || 0, category_name, category_image]
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
    let { parent_id, category_name, existing_category_image } = req.body;
    const mediaFile = req.files && req.files.length > 0 ? req.files[0] : null;

    let category_image = existing_category_image ? existing_category_image.replace(/^https?:\/\/[^\/]+/i, '') : null;
    if (mediaFile) {
        category_image = `/uploads/${mediaFile.filename}`;
    }

    if (category_name) category_name = category_name.trim();
    console.log(`[STITCH_CAT] UPDATE_SIGNAL: ID=${id} NAME="${category_name}"`);

    try {
        const result = await pool.query(
            'UPDATE categorys SET parent_id = $1, category_name = $2, category_image = $3 WHERE id = $4 RETURNING *',
            [parseInt(parent_id) || 0, category_name, category_image, id]
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
        // 🗑️ Hard Delete Signal (Permanent Manifest Purge)
        const result = await pool.query('DELETE FROM categorys WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            console.log(`[STITCH_CAT] DELETE_FAIL: ID=${id} (NOT_FOUND)`);
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        console.log(`[STITCH_CAT] DELETE_OK: ID=${id} (PURGED_PERMANENTLY)`);
        res.status(200).json({ success: true, message: 'Category permanently removed from manifest.' });
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
