const { pool } = require('../config/db');


const getProducts = async (req, res) => {
    const { category, show_inactive } = req.query;
    try {
        let query = `
                SELECT p.*, 
                       (SELECT image_path FROM product_images WHERE product_id = p.id AND (image_path IS NOT NULL AND image_path != '' AND image_path != '/') ORDER BY (CASE WHEN image_type = 'main' THEN 0 ELSE 1 END), id ASC LIMIT 1) as main_image,
                       (SELECT hover_path FROM product_images WHERE product_id = p.id AND (hover_path IS NOT NULL AND hover_path != '' AND hover_path != '/') AND image_type = 'hover' LIMIT 1) as hover_image,
                       (SELECT COALESCE(json_agg(json_build_object('filter_type_id', filter_type_id, 'filter_value', filter_value)), '[]') FROM product_filters WHERE product_id = p.id AND is_deleted = false) as active_filters,
                       (SELECT COALESCE(json_agg(json_build_object(
                           'color', LOWER(v.color),
                           'image', (SELECT image_url FROM variant_images WHERE variant_id = v.id ORDER BY id ASC LIMIT 1)
                       )), '[]') FROM (SELECT DISTINCT ON (LOWER(color)) color, id FROM variants WHERE product_id = p.id AND color IS NOT NULL AND color != '' ORDER BY LOWER(color), id ASC) v) as variant_data
                FROM product_details p
            `;
        let params = [];
        let conditions = [];

        // 🛡️ PERMANENT MANIFEST GUARD: Filter out soft-deleted records
        conditions.push(`p.is_deleted = false`);

        if (category && category !== 'All') {
            params.push(category);
            conditions.push(`p.category_id = $${params.length}`);
        }

        // 🛡️ DEFAULT: Only show active products to public. Dashboard can bypass with ?show_inactive=true
        if (show_inactive !== 'true') {
            conditions.push(`p.is_active = true`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        query += ` ORDER BY p.id ASC`;

        console.log(`[STITCH_HUB] GET_PRODUCTS_QUERY:`, { query, params });
        const result = await pool.query(query, params);
        console.log(`[STITCH_HUB] QUERY_RESULT: COUNT=${result.rows.length}`);
        const serverHost = `${req.protocol}://${req.get('host')}`;
        const data = result.rows.map(prod => {
            const rawMain = prod.main_image || prod.image; // Global fallback to legacy column
            const normalizedMain = rawMain ? (rawMain.startsWith('http') ? rawMain : `${serverHost}${rawMain.startsWith('/') ? '' : '/'}${rawMain.trim()}`) : null;

            const vData = (prod.variant_data || []).map(v => ({
                color: v.color,
                image: v.image ? (v.image.startsWith('http') ? v.image : `${serverHost}${v.image.startsWith('/') ? '' : '/'}${v.image.trim()}`) : null
            }));

            return {
                ...prod,
                image: normalizedMain,
                main_image: normalizedMain,
                hover_image: prod.hover_image ? (prod.hover_image.startsWith('http') ? prod.hover_image : `${serverHost}${prod.hover_image.startsWith('/') ? '' : '/'}${prod.hover_image.trim()}`) : null,
                variant_data: vData
            };
        });
        res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, category_name FROM categorys WHERE is_deleted = false ORDER BY id ASC`);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const cleanId = id.trim().toLowerCase();
        const isNumeric = /^\d+$/.test(cleanId);

        const query = `
            SELECT p.*, c.category_name 
            FROM product_details p 
            LEFT JOIN categorys c ON p.category_id = c.id 
            WHERE (p.id::text = $1 
               OR p.modal ILIKE REPLACE($1, '-', ' ')
               OR p.product_name ILIKE REPLACE($1, '-', ' ')
               OR LOWER(REPLACE(p.modal, ' ', '-')) = $1)
               AND p.is_deleted = false
               LIMIT 1
        `;
        const prodRes = await pool.query(query, [cleanId]);
        console.log('GET_PRODUCT_RESULT:', { id, cleanId, count: prodRes.rows.length });
        if (prodRes.rows.length === 0) {
            const nears = await pool.query('SELECT modal FROM product_details LIMIT 5');
            console.log('404_DEBUG:', { search: cleanId, table_modals: nears.rows.map(r => r.modal) });
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const prod = prodRes.rows[0];
        const serverHost = `${req.protocol}://${req.get('host')}`;

        // Normalize paths from prod_details columns
        const normalizeMain = (p) => p && !p.startsWith('http') ? `${serverHost}${p.startsWith('/') ? '' : '/'}${p.trim()}` : p;
        if (prod.image) prod.image = normalizeMain(prod.image);
        if (prod.hover_image) prod.hover_image = normalizeMain(prod.hover_image);
        if (prod.desktop_banner) prod.desktop_banner = normalizeMain(prod.desktop_banner);
        if (prod.mobile_banner) prod.mobile_banner = normalizeMain(prod.mobile_banner);

        // 📸 Fetch ALL images from product_images (including hover paths)
        const imagesRes = await pool.query('SELECT image_path, hover_path, image_type FROM product_images WHERE product_id = $1', [prod.id]);
        prod.product_images = imagesRes.rows.map(img => {
            const normalize = (p) => p && !p.startsWith('http') ? `${serverHost}${p.startsWith('/') ? '' : '/'}${p.trim()}` : p;
            return {
                ...img,
                image_path: normalize(img.image_path),
                hover_path: normalize(img.hover_path)
            };
        });

        // 📸 Re-fetch main and hover if missing in main row (redundancy/safety)
        if (!prod.image) {
            const m = prod.product_images.find(img => img.image_type === 'main' || (img.image_path && img.image_type !== 'hover')) || {};
            prod.image = m.image_path || null;
        }
        if (!prod.hover_image) {
            const h = prod.product_images.find(img => img.image_type === 'hover' || img.hover_path) || {};
            prod.hover_image = h.hover_path || h.image_path || null;
        }

        // 📐 Global Specifications (variant_id = 0) with Fallback to first variant if empty
        let specRes = await pool.query('SELECT specification_name as label, specification_value as value, spec_label_id FROM specifications WHERE product_id = $1 AND (variant_id = 0 OR variant_id IS NULL) AND specification_deleted = false ORDER BY order_id ASC', [prod.id]);
        if (specRes.rows.length === 0) {
            specRes = await pool.query('SELECT specification_name as label, specification_value as value, spec_label_id FROM specifications WHERE product_id = $1 AND specification_deleted = false ORDER BY variant_id ASC, order_id ASC LIMIT 15', [prod.id]);
        }
        prod.specifications = specRes.rows;

        // ✏️ Global Features (variant_id = 0) with Fallback
        let featuresRes = await pool.query('SELECT features FROM features WHERE product_id = $1 AND (variant_id = 0 OR variant_id IS NULL) AND is_deleted = false', [prod.id]);
        if (featuresRes.rows.length === 0) {
            featuresRes = await pool.query('SELECT features FROM features WHERE product_id = $1 AND (variant_id IS NOT NULL AND variant_id != 0) AND is_deleted = false LIMIT 10', [prod.id]);
        }
        prod.featuresList = featuresRes.rows.map(f => f.features);

        // 3. Global Filters (variant_id = 0)
        const filterRes = await pool.query('SELECT * FROM product_filters WHERE product_id = $1 AND variant_id = 0 AND is_deleted = false', [prod.id]);
        prod.filters = filterRes.rows;

        // 4. Variants with their Specific Configurations
        const varRes = await pool.query('SELECT * FROM variants WHERE product_id = $1 ORDER BY id ASC', [prod.id]);
        const variants = varRes.rows;

        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];

            // a. Images
            const imgRes = await pool.query('SELECT * FROM variant_images WHERE variant_id = $1 ORDER BY id ASC', [v.id]);
            v.previews = imgRes.rows.map(img => {
                const url = img.image_url || '';
                if (url.startsWith('http')) return url;
                const slash = url.startsWith('/') ? '' : '/';
                return `${serverHost}${slash}${url.trim()}`;
            });

            // b. Features
            const vFeats = await pool.query('SELECT features FROM features WHERE variant_id = $1 AND is_deleted = false', [v.id]);
            v.features = vFeats.rows.map(r => r.features);

            // c. Filters
            const vFilters = await pool.query('SELECT filter_type_id as id, filter_value as value FROM product_filters WHERE variant_id = $1 AND is_deleted = false', [v.id]);
            v.filters = vFilters.rows;

            // d. Specs
            const vSpecs = await pool.query('SELECT specification_name as label, specification_value as value, spec_label_id as id, order_id FROM specifications WHERE variant_id = $1 AND specification_deleted = false ORDER BY order_id ASC', [v.id]);
            v.specs = vSpecs.rows;

            v.Color = v.color || '';
            v.Size = v.size || '';
            v.Style = v.style || '';
            v.variantFiles = [];
            v.description = v.description || '';
            v.modelName = v.model_name || '';
            v.productName = v.product_name || '';
        }
        prod.variants = variants;

        // 📸 Main Product Secondary Images (Gallery)
        const prodImgRes = await pool.query('SELECT * FROM product_images WHERE product_id = $1 AND image_type = \'gallery\' AND image_path IS NOT NULL AND image_path != \'\' AND image_path != \'/\' ORDER BY id ASC', [prod.id]);
        const normalize = (p) => {
            if (!p) return null;
            const trimmed = p.trim();
            if (trimmed.startsWith('http')) return trimmed;
            const slash = trimmed.startsWith('/') ? '' : '/';
            return `${serverHost}${slash}${trimmed}`;
        };
        prod.product_images = prodImgRes.rows.map(img => ({
            id: img.id,
            image_path: normalize(img.image_path),
            hover_path: normalize(img.hover_path),
            raw_path: img.image_path,
            raw_hover: img.hover_path
        }));

        // 📂 Downloads (Technical & General)
        const downloadRes = await pool.query('SELECT * FROM additional_downloads WHERE product_id = $1 AND is_deleted = false ORDER BY id ASC', [prod.id]);
        prod.downloads = downloadRes.rows.filter(d => d.download_type === 'general').map(d => ({
            id: d.id,
            download_path: normalize(d.download_path),
            download_label: d.download_label,
            preview: d.download_path // raw path for frontend
        }));
        prod.technical_manuals = downloadRes.rows.filter(d => d.download_type === 'technical').map(d => ({
            id: d.id,
            download_path: normalize(d.download_path),
            download_label: d.download_label,
            preview: d.download_path
        }));

        res.status(200).json({ success: true, data: prod });
    } catch (e) {
        console.error('GET_PRODUCT_DETAIL_ERROR:', e);
        res.status(500).json({ success: false, message: e.message });
    }
};

const getSpecLabels = async (req, res) => {
    const { category_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM spec_label WHERE category_id = $1 AND is_deleted = false ORDER BY id ASC', [category_id]);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const addSpecLabel = async (req, res) => {
    let { category_id, spec_label, spec_options } = req.body;
    if (spec_label) spec_label = spec_label.trim();

    try {
        // 1. Check if it exists (case-insensitive)
        const checkRes = await pool.query(
            `SELECT * FROM spec_label WHERE category_id = $1 AND spec_label ILIKE $2`,
            [category_id, spec_label]
        );

        if (checkRes.rows.length > 0) {
            // 2. If it exists, Reactivate it if it was deleted, and update options
            const existing = checkRes.rows[0];
            const updateRes = await pool.query(
                `UPDATE spec_label SET is_deleted = false, spec_options = $1 WHERE id = $2 RETURNING *`,
                [spec_options || existing.spec_options, existing.id]
            );
            return res.status(200).json({ success: true, message: 'Label reactivated/updated', data: updateRes.rows[0] });
        }

        // 3. Create new if not exists
        const result = await pool.query(
            `INSERT INTO spec_label (category_id, spec_label, spec_options) VALUES ($1, $2, $3) RETURNING *`,
            [category_id, spec_label, spec_options || null]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("ADD SPEC LABEL ERROR:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const addProduct = async (req, res) => {
    const bodyArgs = req.body;
    const {
        category_id, modal, modal_name, product_name,
        product_features, product_description, mb_compat, cooler_compat,
        panel_type, installed_fans, installed_psu, price
    } = bodyArgs;

    const specifications = bodyArgs.specifications ? (typeof bodyArgs.specifications === 'string' ? JSON.parse(bodyArgs.specifications) : bodyArgs.specifications) : [];
    const featuresList = bodyArgs.featuresList ? (typeof bodyArgs.featuresList === 'string' ? JSON.parse(bodyArgs.featuresList) : bodyArgs.featuresList) : [];
    const filters = bodyArgs.filters ? (typeof bodyArgs.filters === 'string' ? JSON.parse(bodyArgs.filters) : bodyArgs.filters) : [];

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert product
        const mainImage = req.files.find(f => f.fieldname === 'image');
        const hoverImage = req.files.find(f => f.fieldname === 'hover_image');

        const result = await client.query(
            `INSERT INTO product_details (
                category_id, modal, modal_name, product_name, 
                product_description, product_features, mb_compat, 
                cooler_compat, panel_type, installed_fans, 
                installed_psu, price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
            [
                category_id || null, modal || null, modal_name || null, product_name || null,
                product_description || null, product_features || null, mb_compat || null,
                cooler_compat || null, panel_type || null, installed_fans || null,
                installed_psu || null, price || 0
            ]
        );
        const product_id = result.rows[0].id;

        // 📸 Save Main & Hover Images to product_images table
        if (mainImage) {
            await client.query(`INSERT INTO product_images (product_id, image_path, image_type) VALUES ($1, $2, 'main')`, [product_id, `/uploads/${mainImage.filename}`]);
        }
        if (hoverImage) {
            await client.query(`INSERT INTO product_images (product_id, hover_path, image_type) VALUES ($1, $2, 'hover')`, [product_id, `/uploads/${hoverImage.filename}`]);
        }

        // 2. Add specifications (Global, variant_id = 0)
        if (Array.isArray(specifications)) {
            for (const spec of specifications) {
                if (spec.specification_name && spec.specification_value) {
                    await client.query(
                        `INSERT INTO specifications (product_id, variant_id, category_id, specification_name, specification_value, order_id, spec_label_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [product_id, 0, category_id, spec.specification_name, spec.specification_value, spec.order_id || null, spec.spec_label_id || null]
                    );
                }
            }
        }

        // 3. Add features (Global, variant_id = 0)
        if (Array.isArray(featuresList)) {
            for (const feat of featuresList) {
                if (feat && feat.trim() !== '') {
                    await client.query(`INSERT INTO features (product_id, variant_id, category_id, features) VALUES ($1, $2, $3, $4)`, [product_id, 0, category_id, feat.trim()]);
                }
            }
        }

        // 5. Save Combinations (Variants) with specific Features, Filters, & Specs
        const combinations = typeof req.body.combinations === 'string' ? JSON.parse(req.body.combinations) : req.body.combinations;
        if (combinations && combinations.length > 0) {
            for (let i = 0; i < combinations.length; i++) {
                const comb = combinations[i];
                const variantRes = await client.query(
                    `INSERT INTO variants (product_id, color, size, style, description, model_name, product_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                    [product_id, comb.Color || null, comb.Size || null, comb.Style || null, comb.description || null, comb.modelName || null, comb.productName || null]
                );
                const variant_id = variantRes.rows[0].id;

                // 📸 Variant Images
                const variantImages = req.files.filter(f => f.fieldname === `comb_images_${i}`);
                const finalOrder = JSON.parse(req.body[`comb_images_order_${i}`] || '[]');
                let fileIdx = 0;
                for (const item of finalOrder) {
                    let imgUrl = '';
                    if (item.startsWith('FILE_')) {
                        if (variantImages[fileIdx]) {
                            imgUrl = `/uploads/${variantImages[fileIdx].filename}`;
                            fileIdx++;
                        }
                    } else if (item) {
                        imgUrl = item.replace(/^https?:\/\/[^\/]+/i, '');
                    }
                    if (imgUrl) {
                        await client.query(
                            `INSERT INTO variant_images (product_id, variant_id, image_url) VALUES ($1, $2, $3)`,
                            [product_id, variant_id, imgUrl]
                        );
                    }
                }

                // 📝 Variant Features
                if (comb.features && Array.isArray(comb.features)) {
                    for (const feat of comb.features) {
                        if (feat.trim()) {
                            await client.query(
                                `INSERT INTO features (product_id, variant_id, category_id, features) VALUES ($1, $2, $3, $4)`,
                                [product_id, variant_id, category_id, feat]
                            );
                        }
                    }
                }

                // 🔍 Variant Filters
                if (comb.filters && Array.isArray(comb.filters)) {
                    for (const f of comb.filters) {
                        if (f.value) {
                            await client.query(
                                `INSERT INTO product_filters (product_id, variant_id, category_id, filter_type_id, filter_value, filter_value_id) VALUES ($1, $2, $3, $4, $5, $6)`,
                                [product_id, variant_id, category_id, f.id, f.value, f.filter_value_id || null]
                            );
                        }
                    }
                }

                // 📐 Variant Specs
                if (comb.specs && Array.isArray(comb.specs)) {
                    for (const s of comb.specs) {
                        if (s.value) {
                            await client.query(
                                `INSERT INTO specifications (product_id, variant_id, category_id, specification_name, specification_value, spec_label_id) VALUES ($1, $2, $3, $4, $5, $6)`,
                                [product_id, variant_id, category_id, s.label, s.value, s.id]
                            );
                        }
                    }
                }
            }
        }

        // 6. Add global filters (variant_id = 0)
        if (Array.isArray(filters)) {
            for (const f of filters) {
                if (f.filter_type_id && f.filter_value) {
                    await client.query(
                        `INSERT INTO product_filters (product_id, variant_id, category_id, filter_type_id, filter_value, filter_value_id) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [product_id, 0, category_id, f.filter_type_id, f.filter_value, f.filter_value_id || null]
                    );
                }
            }
        }

        // 7. Add product images (Gallery)
        const productImageFiles = req.files ? req.files.filter(f => f.fieldname === 'product_images') : [];
        for (const file of productImageFiles) {
            const imgPath = `/uploads/${file.filename}`;
            await client.query(`INSERT INTO product_images (product_id, image_path) VALUES ($1, $2)`, [product_id, imgPath]);
        }

        // 8. Add Product Manuals & Banners
        const dBanner = req.files.find(f => f.fieldname === 'desktop_banner');
        const mBanner = req.files.find(f => f.fieldname === 'mobile_banner');

        if (dBanner || mBanner) {
            await client.query(
                `UPDATE product_details SET desktop_banner = $1, mobile_banner = $2 WHERE id = $3`,
                [
                    dBanner ? `/uploads/${dBanner.filename}` : null,
                    mBanner ? `/uploads/${mBanner.filename}` : null,
                    product_id
                ]
            );
        }

        // --- 📂 Downloads Sync ---
        const handleDownloadsSync = async (configKey, filePrefix, type) => {
            const config = typeof req.body[configKey] === 'string' ? JSON.parse(req.body[configKey]) : req.body[configKey];
            if (!config) return;
            for (let i = 0; i < config.length; i++) {
                const dl = config[i];
                if (dl.isNew) {
                    const file = req.files.find(f => f.fieldname === `${filePrefix}_${i}`);
                    if (file) {
                        await client.query(
                            `INSERT INTO additional_downloads (product_id, download_path, download_label, download_type) VALUES ($1, $2, $3, $4)`,
                            [product_id, `/uploads/${file.filename}`, dl.label, type]
                        );
                    }
                }
            }
        };

        await handleDownloadsSync('downloads_config', 'download_file', 'general');
        await handleDownloadsSync('manuals_config', 'manual_file', 'technical');

        await client.query('COMMIT');
        res.status(201).json({ success: true, message: 'Product added!', data: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("ADD PRODUCT ERROR:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    } finally {
        client.release();
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const bodyArgs = req.body;
    let { category_id, modal } = bodyArgs;

    // Parse structures
    const specifications = typeof bodyArgs.specifications === 'string' ? JSON.parse(bodyArgs.specifications) : bodyArgs.specifications;
    const featuresList = typeof bodyArgs.featuresList === 'string' ? JSON.parse(bodyArgs.featuresList) : bodyArgs.featuresList;
    const filters = typeof bodyArgs.filters === 'string' ? JSON.parse(bodyArgs.filters) : bodyArgs.filters;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update main product details (Full Sync)
        await client.query(
            `UPDATE product_details SET 
                category_id=$1, modal=$2, modal_name=$3, product_name=$4, 
                product_description=$5, product_features=$6, mb_compat=$7, 
                cooler_compat=$8, panel_type=$9, installed_fans=$10, 
                installed_psu=$11, price=$12
             WHERE id = $13`,
            [
                category_id || null, modal || null, bodyArgs.modal_name || null, bodyArgs.product_name || null,
                bodyArgs.product_description || null, bodyArgs.product_features || null, bodyArgs.mb_compat || null,
                bodyArgs.cooler_compat || null, bodyArgs.panel_type || null, bodyArgs.installed_fans || null,
                bodyArgs.installed_psu || null, bodyArgs.price || 0, id
            ]
        );

        // 📸 Update Main & Hover in product_images table
        const mainImageFile = req.files.find(f => f.fieldname === 'image');
        const hoverImageFile = req.files.find(f => f.fieldname === 'hover_image');

        if (mainImageFile) {
            await client.query(`DELETE FROM product_images WHERE product_id = $1 AND image_type = 'main'`, [id]);
            await client.query(`INSERT INTO product_images (product_id, image_path, image_type) VALUES ($1, $2, 'main')`, [id, `/uploads/${mainImageFile.filename}`]);
        } else if (bodyArgs.existing_image) {
            const path = bodyArgs.existing_image.replace(/^https?:\/\/[^\/]+/i, '').trim();
            if (path && path !== '/') {
                await client.query(`DELETE FROM product_images WHERE product_id = $1 AND image_type = 'main'`, [id]);
                await client.query(`INSERT INTO product_images (product_id, image_path, image_type) VALUES ($1, $2, 'main')`, [id, path]);
            }
        }

        if (hoverImageFile) {
            await client.query(`DELETE FROM product_images WHERE product_id = $1 AND image_type = 'hover'`, [id]);
            await client.query(`INSERT INTO product_images (product_id, hover_path, image_type) VALUES ($1, $2, 'hover')`, [id, `/uploads/${hoverImageFile.filename}`]);
        } else if (bodyArgs.existing_hover_image) {
            const hPath = bodyArgs.existing_hover_image.replace(/^https?:\/\/[^\/]+/i, '').trim();
            if (hPath && hPath !== '/') {
                await client.query(`DELETE FROM product_images WHERE product_id = $1 AND image_type = 'hover'`, [id]);
                await client.query(`INSERT INTO product_images (product_id, hover_path, image_type) VALUES ($1, $2, 'hover')`, [id, hPath]);
            }
        }

        // 📔 Update Downloadables (Banners)
        const deskBannerFile = req.files.find(f => f.fieldname === 'desktop_banner');
        const mobBannerFile = req.files.find(f => f.fieldname === 'mobile_banner');

        let dPath = null;
        if (deskBannerFile) dPath = `/uploads/${deskBannerFile.filename}`;
        else if (bodyArgs.remove_desktop_banner === 'true') dPath = null;
        else if (bodyArgs.existing_desktop_banner) dPath = bodyArgs.existing_desktop_banner.replace(/^https?:\/\/[^\/]+/i, '');

        let mPath = null;
        if (mobBannerFile) mPath = `/uploads/${mobBannerFile.filename}`;
        else if (bodyArgs.remove_mobile_banner === 'true') mPath = null;
        else if (bodyArgs.existing_mobile_banner) mPath = bodyArgs.existing_mobile_banner.replace(/^https?:\/\/[^\/]+/i, '');

        await client.query(
            `UPDATE product_details SET desktop_banner = $1, mobile_banner = $2 WHERE id = $3`,
            [dPath, mPath, id]
        );

        // --- 📂 Downloads Synchronization (Surgical) ---
        const syncDownloads = async (configKey, filePrefix, type) => {
            const config = typeof bodyArgs[configKey] === 'string' ? JSON.parse(bodyArgs[configKey]) : bodyArgs[configKey];
            if (!config) return;

            // Soft-delete current for this type if not provided in config
            await client.query(`UPDATE additional_downloads SET is_deleted = true WHERE product_id = $1 AND download_type = $2`, [id, type]);

            for (let i = 0; i < config.length; i++) {
                const dl = config[i];
                if (dl.isNew) {
                    const file = req.files.find(f => f.fieldname === `${filePrefix}_${i}`);
                    if (file) {
                        await client.query(
                            `INSERT INTO additional_downloads (product_id, download_path, download_label, download_type) VALUES ($1, $2, $3, $4)`,
                            [id, `/uploads/${file.filename}`, dl.label, type]
                        );
                    }
                } else if (dl.path) {
                    // Reactive existing
                    await client.query(
                        `UPDATE additional_downloads SET is_deleted = false, download_label = $1 WHERE product_id = $2 AND download_path = $3 AND download_type = $4`,
                        [dl.label, id, dl.path, type]
                    );
                }
            }
        };

        await syncDownloads('downloads_config', 'download_file', 'general');
        await syncDownloads('manuals_config', 'manual_file', 'technical');

        // 🛠️ SURGICAL UPDATES TO PREVENT "FILL BUG" (Soft-delete batch reset)
        await client.query(`UPDATE specifications SET specification_deleted = true WHERE product_id = $1 AND variant_id = 0`, [id]);
        await client.query(`UPDATE features SET is_deleted = true WHERE product_id = $1 AND variant_id = 0`, [id]);
        await client.query(`UPDATE product_filters SET is_deleted = true WHERE product_id = $1 AND variant_id = 0`, [id]);

        // --- 📐 GLOBAL SPECIFICATIONS ---
        if (Array.isArray(specifications)) {
            for (const spec of specifications) {
                if (spec.specification_name && spec.specification_value) {
                    const gOrder = spec.order || spec.order_id || null;
                    const check = await client.query(
                        `SELECT id FROM specifications WHERE product_id = $1 AND variant_id = 0 AND spec_label_id = $2`,
                        [id, spec.spec_label_id || -1]
                    );
                    if (check.rows.length > 0) {
                        await client.query(
                            `UPDATE specifications SET specification_name = $1, specification_value = $2, specification_deleted = false, order_id = $3 WHERE id = $4`,
                            [spec.specification_name, spec.specification_value, gOrder, check.rows[0].id]
                        );
                    } else {
                        await client.query(
                            `INSERT INTO specifications (product_id, variant_id, specification_name, specification_value, order_id, spec_label_id) VALUES ($1, 0, $2, $3, $4, $5)`,
                            [id, spec.specification_name, spec.specification_value, gOrder, spec.spec_label_id || null]
                        );
                    }
                }
            }
        }

        // --- ✏️ GLOBAL FEATURES ---
        if (Array.isArray(featuresList)) {
            for (const feat of featuresList) {
                if (feat && feat.trim() !== '') {
                    const check = await client.query(
                        `SELECT id FROM features WHERE product_id = $1 AND variant_id = 0 AND features ILIKE $2`,
                        [id, feat.trim()]
                    );
                    if (check.rows.length > 0) {
                        await client.query(`UPDATE features SET is_deleted = false WHERE id = $1`, [check.rows[0].id]);
                    } else {
                        await client.query(`INSERT INTO features (product_id, variant_id, features) VALUES ($1, 0, $2)`, [id, feat.trim()]);
                    }
                }
            }
        }

        // --- 🏺 GLOBAL FILTERS ---
        if (Array.isArray(filters)) {
            for (const f of filters) {
                if (f.id && f.value) {
                    const check = await client.query(
                        `SELECT id FROM product_filters WHERE product_id = $1 AND variant_id = 0 AND filter_type_id = $2`,
                        [id, f.id]
                    );
                    if (check.rows.length > 0) {
                        await client.query(`UPDATE product_filters SET filter_value = $1, filter_value_id = $2, is_deleted = false WHERE id = $3`, [f.value, f.filter_value_id || null, check.rows[0].id]);
                    } else {
                        await client.query(`INSERT INTO product_filters (product_id, variant_id, category_id, filter_type_id, filter_value, filter_value_id) VALUES ($1, 0, $2, $3, $4, $5)`, [id, category_id, f.id, f.value, f.filter_value_id || null]);
                    }
                }
            }
        }

        // --- 🧬 VARIANTS & COMBINATIONS ---
        const activeVariantIds = [];
        const combinations = typeof req.body.combinations === 'string' ? JSON.parse(req.body.combinations) : req.body.combinations;

        if (combinations && combinations.length > 0) {
            for (let i = 0; i < combinations.length; i++) {
                const comb = combinations[i];

                // Match existing variant by attributes
                const varCheck = await client.query(
                    `SELECT id FROM variants WHERE product_id = $1 AND color IS NOT DISTINCT FROM $2 AND size IS NOT DISTINCT FROM $3 AND style IS NOT DISTINCT FROM $4`,
                    [id, comb.Color || null, comb.Size || null, comb.Style || null]
                );

                let variant_id;
                if (varCheck.rows.length > 0) {
                    variant_id = varCheck.rows[0].id;
                    await client.query(
                        `UPDATE variants SET description = $1, model_name = $2, product_name = $3 WHERE id = $4`,
                        [comb.description || null, comb.modelName || null, comb.productName || null, variant_id]
                    );
                } else {
                    const varIns = await client.query(
                        `INSERT INTO variants (product_id, color, size, style, description, model_name, product_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                        [id, comb.Color || null, comb.Size || null, comb.Style || null, comb.description || null, comb.modelName || null, comb.productName || null]
                    );
                    variant_id = varIns.rows[0].id;
                }
                activeVariantIds.push(variant_id);

                // --- 📸 Variant Images ---
                await client.query(`DELETE FROM variant_images WHERE variant_id = $1`, [variant_id]);
                const variantImages = req.files.filter(f => f.fieldname === `comb_images_${i}`);
                const finalOrder = JSON.parse(req.body[`comb_images_order_${i}`] || '[]');
                let fileIdx = 0;
                for (const item of finalOrder) {
                    let imgUrl = item.startsWith('FILE_') ? (variantImages[fileIdx] ? `/uploads/${variantImages[fileIdx++].filename}` : '') : item.replace(/^https?:\/\/[^\/]+/i, '').trim();
                    if (imgUrl) await client.query(`INSERT INTO variant_images (product_id, variant_id, image_url) VALUES ($1, $2, $3)`, [id, variant_id, imgUrl]);
                }

                // --- ✏️ Variant Features ---
                await client.query(`UPDATE features SET is_deleted = true WHERE variant_id = $1`, [variant_id]);
                if (comb.features && Array.isArray(comb.features)) {
                    for (const feat of comb.features) {
                        if (feat.trim()) {
                            const fCheck = await client.query(`SELECT id FROM features WHERE variant_id = $1 AND features ILIKE $2`, [variant_id, feat.trim()]);
                            if (fCheck.rows.length > 0) await client.query(`UPDATE features SET is_deleted = false WHERE id = $1`, [fCheck.rows[0].id]);
                            else await client.query(`INSERT INTO features (product_id, variant_id, category_id, features) VALUES ($1, $2, $3, $4)`, [id, variant_id, category_id, feat]);
                        }
                    }
                }

                // --- 🔍 Variant Filters ---
                await client.query(`UPDATE product_filters SET is_deleted = true WHERE variant_id = $1`, [variant_id]);
                if (comb.filters && Array.isArray(comb.filters)) {
                    for (const vFilter of comb.filters) {
                        if (vFilter.value) {
                            const flCheck = await client.query(`SELECT id FROM product_filters WHERE variant_id = $1 AND filter_type_id = $2`, [variant_id, vFilter.id]);
                            if (flCheck.rows.length > 0) await client.query(`UPDATE product_filters SET filter_value = $1, filter_value_id = $2, is_deleted = false WHERE id = $3`, [vFilter.value, vFilter.filter_value_id || null, flCheck.rows[0].id]);
                            else await client.query(`INSERT INTO product_filters (product_id, variant_id, category_id, filter_type_id, filter_value, filter_value_id) VALUES ($1, $2, $3, $4, $5, $6)`, [id, variant_id, category_id, vFilter.id, vFilter.value, vFilter.filter_value_id || null]);
                        }
                    }
                }

                // --- 📐 Variant Specifications ---
                await client.query(`UPDATE specifications SET specification_deleted = true WHERE variant_id = $1`, [variant_id]);
                if (comb.specs && Array.isArray(comb.specs)) {
                    for (const s of comb.specs) {
                        if (s.value) {
                            const sOrder = s.order || s.order_id || null;
                            const sCheck = await client.query(`SELECT id FROM specifications WHERE variant_id = $1 AND spec_label_id = $2`, [variant_id, s.id]);
                            if (sCheck.rows.length > 0) {
                                await client.query(
                                    `UPDATE specifications SET specification_value = $1, specification_deleted = false, order_id = $2 WHERE id = $3`,
                                    [s.value, sOrder, sCheck.rows[0].id]
                                );
                            } else {
                                await client.query(
                                    `INSERT INTO specifications (product_id, variant_id, category_id, specification_name, specification_value, spec_label_id, order_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                                    [id, variant_id, category_id, s.label, s.value, s.id, sOrder]
                                );
                            }
                        }
                    }
                }
            }
        }

        // Cleanup orphaned variants
        if (activeVariantIds.length > 0) {
            await client.query(`DELETE FROM variants WHERE product_id = $1 AND id != ALL($2)`, [id, activeVariantIds]);
        } else {
            await client.query(`DELETE FROM variants WHERE product_id = $1`, [id]);
        }

        // --- 📸 Main Product Secondary Images (Gallery) ---
        await client.query(`DELETE FROM product_images WHERE product_id = $1 AND image_type = 'gallery'`, [id]);
        const newProdFiles = req.files.filter(f => f.fieldname === 'product_images');
        const existingProdImages = (typeof bodyArgs.existing_product_images === 'string' ? JSON.parse(bodyArgs.existing_product_images || '[]') : bodyArgs.existing_product_images) || [];
        for (const img of [...existingProdImages, ...newProdFiles.map(f => `/uploads/${f.filename}`)]) {
            if (img) await client.query(`INSERT INTO product_images (product_id, image_path) VALUES ($1, $2)`, [id, img.replace(/^https?:\/\/[^\/]+/i, '')]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Product updated surgically' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("UPDATE PRODUCT ERROR:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    } finally {
        client.release();
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`update product_details set is_deleted = true where id = $1`, [id]);
        res.status(200).json({ success: true, message: 'Product manifest moved to bin.' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const deleteSpecLabel = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE spec_label SET is_deleted = true WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: 'Detailed Specification Label successfully deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const getFilterLabels = async (req, res) => {
    const { category_id } = req.params;
    console.log("FETCHING LABELS FOR CATEGORY:", category_id);
    try {
        const result = await pool.query('SELECT * FROM filter_labels WHERE category_id = $1 AND is_deleted = false ORDER BY order_id ASC, id ASC', [category_id]);
        console.log("LABELS FOUND:", result.rows.length);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("GET FILTER LABELS ERROR:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const addFilterLabel = async (req, res) => {
    let { category_id, filter_label } = req.body;
    if (filter_label) filter_label = filter_label.trim();

    try {
        // 🛡️ Atomic Manifest Adoption (Industrial Upsert)
        const result = await pool.query(`
            INSERT INTO filter_labels (category_id, filter_label, order_id) 
            VALUES ($1, $2, (SELECT COALESCE(MAX(order_id), 0) + 1 FROM filter_labels WHERE category_id = $1))
            ON CONFLICT (category_id, LOWER(filter_label)) 
            DO UPDATE SET is_deleted = false, filter_label = EXCLUDED.filter_label
            RETURNING *`,
            [category_id, filter_label]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("ADD FILTER LABEL ERROR:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const deleteFilterLabel = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE filter_labels SET is_deleted = true WHERE id = $1', [id]);
        await pool.query('UPDATE filter_values SET is_deleted = true WHERE filter_label_id = $1', [id]);
        res.status(200).json({ success: true, message: 'Filter Label successfully moved to bin.' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const getFilterValues = async (req, res) => {
    const { label_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM filter_values WHERE filter_label_id = $1 AND is_deleted = false ORDER BY order_id ASC, id ASC', [label_id]);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const addFilterValue = async (req, res) => {
    let { category_id, filter_label_id, filter_value } = req.body;
    if (filter_value) filter_value = filter_value.trim();

    console.log(`[STITCH_DB] ADD_VALUE_SIGNAL: CAT=${category_id} LABEL=${filter_label_id} VALUE=${filter_value}`);

    try {
        // 🛡️ RE-ACTIVATION PULSE: Ensure parent label is alive for this injection
        await pool.query('UPDATE filter_labels SET is_deleted = false WHERE id = $1', [filter_label_id]);

        // 1. Cross-Category Check (High-Fidelity)
        const labelCheck = await pool.query('SELECT * FROM filter_labels WHERE id = $1 AND category_id = $2', [filter_label_id, category_id]);
        if (labelCheck.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Data Mismatch: Label does not belong to specified category.' });
        }

        // 2. Avoid Duplicates (Case-Insensitive)
        const checkRes = await pool.query(
            `SELECT * FROM filter_values WHERE filter_label_id = $1 AND filter_value ILIKE $2`,
            [filter_label_id, filter_value]
        );

        if (checkRes.rows.length > 0) {
            const existing = checkRes.rows[0];
            await pool.query('UPDATE filter_values SET is_deleted = false WHERE id = $1', [existing.id]);
            return res.status(200).json({ success: true, message: 'Specification adopted', data: existing });
        }

        // 3. Atomic Injection
        const result = await pool.query(
            `INSERT INTO filter_values (filter_label_id, filter_value, order_id) 
             VALUES ($1, $2, (SELECT COALESCE(MAX(order_id), 0) + 1 FROM filter_values WHERE filter_label_id = $1)) 
             RETURNING *`,
            [filter_label_id, filter_value]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("ADD FILTER VALUE ERROR:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const getFilterConfig = async (req, res) => {
    const { category_id } = req.params;
    try {
        const labelsRes = await pool.query('SELECT * FROM filter_labels WHERE category_id = $1 AND is_deleted = false ORDER BY order_id ASC, id ASC', [category_id]);

        const labels = labelsRes.rows;
        for (let label of labels) {
            const valuesRes = await pool.query('SELECT id, filter_value FROM filter_values WHERE filter_label_id = $1 AND is_deleted = false ORDER BY order_id ASC, id ASC', [label.id]);
            label.values = valuesRes.rows;
        }

        res.status(200).json({ success: true, data: labels });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const deleteFilterValue = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE filter_values SET is_deleted = true WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: 'Filter Value successfully moved to bin.' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const updateFilterLabel = async (req, res) => {
    const { id } = req.params;
    const { filter_label } = req.body;
    try {
        await pool.query('UPDATE filter_labels SET filter_label = $1 WHERE id = $2', [filter_label, id]);
        res.status(200).json({ success: true, message: 'Filter label updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const updateFilterValue = async (req, res) => {
    const { id } = req.params;
    const { filter_value } = req.body;
    try {
        await pool.query('UPDATE filter_values SET filter_value = $1 WHERE id = $2', [filter_value, id]);
        res.status(200).json({ success: true, message: 'Filter value updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const saveFullFilter = async (req, res) => {
    let { category_id, filter_label, options = [] } = req.body;
    filter_label = filter_label?.toString().trim();
    if (!filter_label) return res.status(400).json({ success: false, message: 'Label name is required.' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Atomic Manifest Adoption (Industrial Upsert)
        const upsertRes = await client.query(`
            INSERT INTO filter_labels (category_id, filter_label, order_id) 
            VALUES ($1, $2, (SELECT COALESCE(MAX(order_id), 0) + 1 FROM filter_labels WHERE category_id = $1))
            ON CONFLICT (category_id, LOWER(filter_label)) 
            DO UPDATE SET is_deleted = false, filter_label = EXCLUDED.filter_label
            RETURNING id`,
            [category_id, filter_label]
        );
        const labelId = upsertRes.rows[0].id;

        // 2. Options Synchronization (Industrial Sync)
        const trimmedOptions = options.map(o => o.toString().trim()).filter(o => o.length > 0);

        // Mark ALL existing as 'Draft-Deleted' (soft reset for this label's pulse)
        await client.query('UPDATE filter_values SET is_deleted = true WHERE filter_label_id = $1', [labelId]);

        for (const val of trimmedOptions) {
            // Check if option existed before
            const valCheck = await client.query(
                'SELECT id FROM filter_values WHERE filter_label_id = $1 AND filter_value ILIKE $2',
                [labelId, val]
            );

            if (valCheck.rows.length > 0) {
                await client.query('UPDATE filter_values SET is_deleted = false, filter_value = $1 WHERE id = $2', [val, valCheck.rows[0].id]);
            } else {
                await client.query(
                    `INSERT INTO filter_values (filter_label_id, filter_value, order_id) 
                     VALUES ($1, $2, (SELECT COALESCE(MAX(order_id), 0) + 1 FROM filter_values WHERE filter_label_id = $1))`,
                    [labelId, val]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, message: 'Filter Manifest Synced Successfully!' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("SAVE FULL FILTER ERROR:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    } finally {
        client.release();
    }
};

const toggleProductHot = async (req, res) => {
    const { id } = req.params;
    console.log(`[STITCH_HUB] TOGGLE_HOT_SIGNAL: ID=${id}`);
    try {
        const result = await pool.query(
            'UPDATE product_details SET is_hot = NOT is_hot WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        console.log(`[STITCH_HUB] HOT_STATE_FINAL: ID=${id}, STATE=${result.rows[0].is_hot}`);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('TOGGLE_HOT_ERROR:', error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const toggleProductNew = async (req, res) => {
    const { id } = req.params;
    console.log(`[STITCH_HUB] TOGGLE_NEW_SIGNAL: ID=${id}`);
    try {
        const result = await pool.query(
            'UPDATE product_details SET is_new = NOT is_new WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        console.log(`[STITCH_HUB] NEW_STATE_FINAL: ID=${id}, STATE=${result.rows[0].is_new}`);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('TOGGLE_NEW_ERROR:', error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const toggleProductActive = async (req, res) => {
    const { id } = req.params;
    console.log(`[STITCH_HUB] TOGGLE_SIGNAL: ID=${id}`);
    try {
        // ⚡ Force-flip the boolean bit and return the new state pulse
        const result = await pool.query(
            'UPDATE product_details SET is_active = NOT COALESCE(is_active, false) WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            console.warn(`[STITCH_HUB] TARGET_NOT_FOUND: ${id}`);
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        console.log(`[STITCH_HUB] STATUS_SYNC: ID=${id}, NEW_ACTIVE=${result.rows[0].is_active}`);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("[STITCH_HUB] TOGGLE_FAILURE:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const updateFilterLabelOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ success: false, message: 'Invalid order data' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of order) {
            await client.query('UPDATE filter_labels SET order_id = $1 WHERE id = $2', [item.order_id, item.id]);
        }
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("REORDER ERROR:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    } finally {
        client.release();
    }
};

const updateFilterValueOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ success: false, message: 'Invalid order data' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of order) {
            await client.query('UPDATE filter_values SET order_id = $1 WHERE id = $2', [item.order_id, item.id]);
        }
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("REORDER VALUES ERROR:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    getProducts,
    getProductById,
    getCategories,
    addProduct,
    getSpecLabels,
    addSpecLabel,
    deleteSpecLabel,
    deleteProduct,
    updateProduct,
    getFilterLabels,
    addFilterLabel,
    deleteFilterLabel,
    getFilterValues,
    addFilterValue,
    deleteFilterValue,
    getFilterConfig,
    saveFullFilter,
    updateFilterLabel,
    updateFilterValue,
    updateFilterLabelOrder,
    updateFilterValueOrder,
    toggleProductHot,
    toggleProductNew,
    toggleProductActive
};
