const { pool } = require('../config/db');


const getProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product_details ORDER BY id ASC');
        const serverHost = `${req.protocol}://${req.get('host')}`;
        const data = result.rows.map(prod => ({
            ...prod,
            image: prod.image ? (prod.image.startsWith('http') ? prod.image : `${serverHost}${prod.image.startsWith('/') ? '' : '/'}${prod.image.trim()}`) : null,
            hover_image: prod.hover_image ? (prod.hover_image.startsWith('http') ? prod.hover_image : `${serverHost}${prod.hover_image.startsWith('/') ? '' : '/'}${prod.hover_image.trim()}`) : null
        }));
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

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const prodRes = await pool.query('SELECT * FROM product_details WHERE id = $1', [id]);
        if (prodRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const prod = prodRes.rows[0];

        // 1. Global Specifications (variant_id = 0)

        const specRes = await pool.query('SELECT * FROM specifications WHERE product_id = $1 AND variant_id = 0 AND specification_deleted = false ORDER BY order_id ASC', [id]);
        prod.specifications = specRes.rows;

        // 2. Global Features (variant_id = 0)
        const featuresRes = await pool.query('SELECT * FROM features WHERE product_id = $1 AND variant_id = 0 AND is_deleted = false', [id]);
        prod.featuresList = featuresRes.rows.map(f => f.features);

        // 3. Global Filters (variant_id = 0)
        const filterRes = await pool.query('SELECT * FROM product_filters WHERE product_id = $1 AND variant_id = 0 AND is_deleted = false', [id]);
        prod.filters = filterRes.rows;

        // 4. Variants with their Specific Configurations
        const varRes = await pool.query('SELECT * FROM variants WHERE product_id = $1 ORDER BY id ASC', [id]);
        const variants = varRes.rows;

        const serverHost = `${req.protocol}://${req.get('host')}`;
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
        prod.combinations = variants;

        const prodImgRes = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY id ASC', [id]);
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

        res.status(200).json({ success: true, data: prod });
    } catch (e) {
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
            `INSERT INTO product_details (category_id, modal) VALUES ($1, $2) RETURNING id`,
            [category_id || null, modal || null]
        );
        const product_id = result.rows[0].id;

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
                                `INSERT INTO product_filters (product_id, variant_id, category_id, filter_type_id, filter_value) VALUES ($1, $2, $3, $4, $5)`,
                                [product_id, variant_id, category_id, f.id, f.value]
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
                        `INSERT INTO product_filters (product_id, variant_id, category_id, filter_type_id, filter_value) VALUES ($1, $2, $3, $4, $5)`,
                        [product_id, 0, category_id, f.filter_type_id, f.filter_value]
                    );
                }
            }
        }

        // 7. Add product images (Gallery & Hover)
        const productImageFiles = req.files ? req.files.filter(f => f.fieldname === 'product_images') : [];
        for (const file of productImageFiles) {
            const imgPath = `/uploads/${file.filename}`;
            await client.query(`INSERT INTO product_images (product_id, image_path) VALUES ($1, $2)`, [product_id, imgPath]);
        }

        if (hoverImage) {
            const hoverPath = `/uploads/${hoverImage.filename}`;
            await client.query(`INSERT INTO product_images (product_id, hover_path) VALUES ($1, $2)`, [product_id, hoverPath]);
        }

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

        // 1. Update main product details
        await client.query(
            `UPDATE product_details SET category_id=$1, modal=$2 WHERE id = $3`,
            [category_id || null, modal || null, id]
        );

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
                        await client.query(`UPDATE product_filters SET filter_value = $1, is_deleted = false WHERE id = $2`, [f.value, check.rows[0].id]);
                    } else {
                        await client.query(`INSERT INTO product_filters (product_id, variant_id, category_id, filter_type_id, filter_value) VALUES ($1, 0, $2, $3, $4)`, [id, category_id, f.id, f.value]);
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
                            if (flCheck.rows.length > 0) await client.query(`UPDATE product_filters SET filter_value = $1, is_deleted = false WHERE id = $2`, [vFilter.value, flCheck.rows[0].id]);
                            else await client.query(`INSERT INTO product_filters (product_id, variant_id, category_id, filter_type_id, filter_value) VALUES ($1, $2, $3, $4, $5)`, [id, variant_id, category_id, vFilter.id, vFilter.value]);
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

        // --- 📸 Main Product Secondary Images ---
        await client.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
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
        await pool.query(`DELETE FROM features WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM specifications WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM variant_images WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM variants WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM product_details WHERE id = $1`, [id]);
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
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
        const result = await pool.query('SELECT * FROM filter_labels WHERE category_id = $1 AND is_deleted = false ORDER BY id ASC', [category_id]);
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
        // 1. Check if it exists (case-insensitive)
        const checkRes = await pool.query(
            `SELECT * FROM filter_labels WHERE category_id = $1 AND filter_label ILIKE $2`,
            [category_id, filter_label]
        );

        if (checkRes.rows.length > 0) {
            // 2. Reactivate if deleted
            const existing = checkRes.rows[0];
            const updateRes = await pool.query(
                `UPDATE filter_labels SET is_deleted = false WHERE id = $1 RETURNING *`,
                [existing.id]
            );
            return res.status(200).json({ success: true, message: 'Filter label reactivated', data: updateRes.rows[0] });
        }

        const result = await pool.query(
            `INSERT INTO filter_labels (category_id, filter_label) VALUES ($1, $2) RETURNING *`,
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
        // Also soft-delete values associated with this label
        await pool.query('UPDATE filter_values SET is_deleted = true WHERE filter_label_id = $1', [id]);
        res.status(200).json({ success: true, message: 'Filter Label successfully deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const getFilterValues = async (req, res) => {
    const { label_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM filter_values WHERE filter_label_id = $1 AND is_deleted = false ORDER BY id ASC', [label_id]);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const addFilterValue = async (req, res) => {
    let { filter_label_id, filter_value } = req.body;
    if (filter_value) filter_value = filter_value.trim();

    try {
        // 1. Check if it exists (case-insensitive)
        const checkRes = await pool.query(
            `SELECT * FROM filter_values WHERE filter_label_id = $1 AND filter_value ILIKE $2`,
            [filter_label_id, filter_value]
        );

        if (checkRes.rows.length > 0) {
            // 2. Reactivate if deleted
            const existing = checkRes.rows[0];
            const updateRes = await pool.query(
                `UPDATE filter_values SET is_deleted = false WHERE id = $1 RETURNING *`,
                [existing.id]
            );
            return res.status(200).json({ success: true, message: 'Filter value reactivated', data: updateRes.rows[0] });
        }

        const result = await pool.query(
            `INSERT INTO filter_values (filter_label_id, filter_value) VALUES ($1, $2) RETURNING *`,
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
        const labelsRes = await pool.query('SELECT * FROM filter_labels WHERE category_id = $1 AND is_deleted = false ORDER BY id ASC', [category_id]);

        const labels = labelsRes.rows;
        for (let label of labels) {
            const valuesRes = await pool.query('SELECT id, filter_value FROM filter_values WHERE filter_label_id = $1 AND is_deleted = false ORDER BY id ASC', [label.id]);
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
        res.status(200).json({ success: true, message: 'Filter Value successfully deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const saveFullFilter = async (req, res) => {
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
        res.status(201).json({ success: true, message: 'Saved successfully!' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    getProducts,
    getProductById,
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
    saveFullFilter
};
