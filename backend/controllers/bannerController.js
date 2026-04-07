const { pool } = require('../config/db');

const getAllBanners = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM home_banner ORDER BY id ASC');
        const serverHost = `${req.protocol}://${req.get('host')}`;
        const data = result.rows.map(banner => ({
            ...banner,
            media_path: banner.media_path ? (banner.media_path.startsWith('http') ? banner.media_path : `${serverHost}${banner.media_path.startsWith('/') ? '' : '/'}${banner.media_path.trim()}`) : null
        }));
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addBanner = async (req, res) => {
    const { banner_text, media_type, subtitle, description } = req.body;
    const mediaFile = req.files && req.files.length > 0 ? req.files[0] : null;

    if (!mediaFile) {
        return res.status(400).json({ success: false, message: 'Media file is required' });
    }

    const media_path = `/uploads/${mediaFile.filename}`;

    try {
        const result = await pool.query(
            'INSERT INTO home_banner (banner_text, media_path, media_type, subtitle, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [banner_text, media_path, media_type || 'image', subtitle, description]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error adding banner:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

const updateBanner = async (req, res) => {
    const { id } = req.params;
    const { banner_text, media_type, existing_media_path, subtitle, description } = req.body;
    const mediaFile = req.files && req.files.length > 0 ? req.files[0] : null;

    let media_path = existing_media_path ? existing_media_path.replace(/^https?:\/\/[^\/]+/i, '') : null;
    if (mediaFile) {
        media_path = `/uploads/${mediaFile.filename}`;
    }

    try {
        const result = await pool.query(
            'UPDATE home_banner SET banner_text = $1, media_path = $2, media_type = $3, subtitle = $4, description = $5 WHERE id = $6 RETURNING *',
            [banner_text, media_path, media_type, subtitle, description, id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

const deleteBanner = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM home_banner WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllBanners,
    addBanner,
    updateBanner,
    deleteBanner
};
