const { pool } = require('../config/db');


const getProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product_details ORDER BY id ASC');
        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
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
        if (prodRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
        
        const prod = prodRes.rows[0];
        
        const specRes = await pool.query('SELECT * FROM specifications WHERE product_id = $1 ORDER BY order_id ASC', [id]);
        prod.specifications = specRes.rows;
        
        const featuresRes = await pool.query('SELECT * FROM features WHERE product_id = $1', [id]);
        prod.featuresList = featuresRes.rows.map(f => f.features);
        
        const varRes = await pool.query('SELECT * FROM variants WHERE product_id = $1', [id]);
        const variants = varRes.rows;
        
        for (let i = 0; i < variants.length; i++) {
            const imgRes = await pool.query('SELECT * FROM variant_images WHERE variant_id = $1', [variants[i].id]);
            variants[i].previews = imgRes.rows.map(img => `http://localhost:5000${img.image_url}`);
            variants[i].Color = variants[i].color || '';
            variants[i].Size = variants[i].size || '';
            variants[i].Style = variants[i].style || '';
            variants[i].variantFiles = [];
        }
        prod.combinations = variants;
        
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
    const { category_id, spec_label } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO spec_label (category_id, spec_label) VALUES ($1, $2) RETURNING *`,
            [category_id, spec_label]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const addProduct = async (req, res) => {

    const bodyArgs = req.body;

    // Extract basic fields securely triggers framing list
    const {
        category_id, size, color, style, modal, modal_name, product_name,
        product_features, product_description, mb_compat, cooler_compat,
        panel_type, installed_fans, installed_psu, price
    } = bodyArgs;

    // 📸 Parse stringified details supporting Multipart payloads flawless flaws flawlessly
    const specs = bodyArgs.specs ? (typeof bodyArgs.specs === 'string' ? JSON.parse(bodyArgs.specs) : bodyArgs.specs) : {};
    const specifications = bodyArgs.specifications ? (typeof bodyArgs.specifications === 'string' ? JSON.parse(bodyArgs.specifications) : bodyArgs.specifications) : [];
    const featuresList = bodyArgs.featuresList ? (typeof bodyArgs.featuresList === 'string' ? JSON.parse(bodyArgs.featuresList) : bodyArgs.featuresList) : [];

    // 📸 Main Image construction


    try {
        const result = await pool.query(
            `INSERT INTO product_details (
                category_id, modal, modal_name, product_name, 
                product_features, product_description, mb_compat, cooler_compat, 
                panel_type, installed_fans, installed_psu, price, specs
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
                category_id || null, modal || null, modal_name || null, product_name || null,
                product_features || null, product_description || null, mb_compat || null, cooler_compat || null,
                panel_type || null, installed_fans || null, installed_psu || null, parseFloat(price) || 0, JSON.stringify(specs)
            ]
        );
        const product_id = result.rows[0].id;

        // 2. Add specifications to Specifications Table (Custom specs list flawlessly)
        if (Array.isArray(specifications)) {
            for (const spec of specifications) {
                if (spec.specification_name && spec.specification_value) {
                    await pool.query(
                        `INSERT INTO specifications (product_id, specification_name, specification_value, order_id, spec_label_id) VALUES ($1, $2, $3, $4, $5)`,
                        [product_id, spec.specification_name, spec.specification_value, spec.order_id || null, spec.spec_label_id || null]
                    );
                }
            }
        }

        // 4. Expand Features items to dedicated features table flaws effortlessly layout:
        if (Array.isArray(featuresList)) {
            for (const feat of featuresList) {
                if (feat && feat.trim() !== '') {
                    await pool.query(
                        `INSERT INTO features (product_id, features) VALUES ($1, $2)`,
                        [product_id, feat.trim()]
                    );
                }
            }
        }
        if (specs && typeof specs === 'object') {
            for (const key in specs) {
                const item = specs[key]; // Item holds { value: '..', order: 1, label: '..' }
                if (item && item.value && item.value.trim() !== '' && item.label) {
                    await pool.query(
                        `INSERT INTO specifications (product_id, specification_name, specification_value, order_id, spec_label_id) VALUES ($1, $2, $3, $4, $5)`,
                        [product_id, item.label, item.value, item.order || null, item.spec_label_id || null]
                    );
                }
            }
        }



        // 5. Add combinations fully support matrix tables node flawlessly flaws
        const combinations = req.body.combinations ? (typeof req.body.combinations === 'string' ? JSON.parse(req.body.combinations) : req.body.combinations) : [];
        if (Array.isArray(combinations)) {
            for (let i = 0; i < combinations.length; i++) {
                const comb = combinations[i];
                const variantResult = await pool.query(
                    `INSERT INTO variants (product_id, color, size, style) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [product_id, comb.Color || '', comb.Size || '', comb.Style || '']
                );
                const variant_id = variantResult.rows[0].id;

                const filesKey = `comb_images_${i}`;
                const rowFiles = req.files ? req.files.filter(f => f.fieldname === filesKey) : [];
                if (Array.isArray(rowFiles)) {
                    for (const file of rowFiles) {
                        const imgUrl = `/uploads/${file.filename}`;
                        await pool.query(
                            `INSERT INTO variant_images (product_id, variant_id, image_url) VALUES ($1, $2, $3)`,
                            [product_id, variant_id, imgUrl]
                        );
                    }
                }
            }
        }

        res.status(201).json({ success: true, message: 'Product added!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const bodyArgs = req.body;
    const {
        category_id, modal, modal_name, product_name,
        product_features, product_description, mb_compat, cooler_compat,
        panel_type, installed_fans, installed_psu, price
    } = bodyArgs;

    const specs = bodyArgs.specs ? (typeof bodyArgs.specs === 'string' ? JSON.parse(bodyArgs.specs) : bodyArgs.specs) : {};
    const specifications = bodyArgs.specifications ? (typeof bodyArgs.specifications === 'string' ? JSON.parse(bodyArgs.specifications) : bodyArgs.specifications) : [];
    const featuresList = bodyArgs.featuresList ? (typeof bodyArgs.featuresList === 'string' ? JSON.parse(bodyArgs.featuresList) : bodyArgs.featuresList) : [];

    try {
        await pool.query(
            `UPDATE product_details SET
                category_id=$1, modal=$2, modal_name=$3, product_name=$4, 
                product_features=$5, product_description=$6, mb_compat=$7, cooler_compat=$8, 
                panel_type=$9, installed_fans=$10, installed_psu=$11, price=$12, specs=$13
             WHERE id = $14`,
            [
                category_id || null, modal || null, modal_name || null, product_name || null,
                product_features || null, product_description || null, mb_compat || null, cooler_compat || null,
                panel_type || null, installed_fans || null, installed_psu || null, parseFloat(price) || 0, JSON.stringify(specs),
                id
            ]
        );

        await pool.query(`DELETE FROM specifications WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM features WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM variants WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM variant_images WHERE product_id = $1`, [id]);

        if (Array.isArray(specifications)) {
            for (const spec of specifications) {
                if (spec.specification_name && spec.specification_value) {
                    await pool.query(
                        `INSERT INTO specifications (product_id, specification_name, specification_value, order_id, spec_label_id) VALUES ($1, $2, $3, $4, $5)`,
                        [id, spec.specification_name, spec.specification_value, spec.order_id || null, spec.spec_label_id || null]
                    );
                }
            }
        }

        if (Array.isArray(featuresList)) {
            for (const feat of featuresList) {
                if (feat && feat.trim() !== '') {
                    await pool.query(`INSERT INTO features (product_id, features) VALUES ($1, $2)`, [id, feat.trim()]);
                }
            }
        }
        if (specs && typeof specs === 'object') {
            for (const key in specs) {
                const item = specs[key];
                if (item && item.value && item.value.trim() !== '' && item.label) {
                    await pool.query(
                        `INSERT INTO specifications (product_id, specification_name, specification_value, order_id, spec_label_id) VALUES ($1, $2, $3, $4, $5)`,
                        [id, item.label, item.value, item.order || null, item.spec_label_id || null]
                    );
                }
            }
        }

        const combinations = req.body.combinations ? (typeof req.body.combinations === 'string' ? JSON.parse(req.body.combinations) : req.body.combinations) : [];
        if (Array.isArray(combinations)) {
            for (let i = 0; i < combinations.length; i++) {
                const comb = combinations[i];
                const variantResult = await pool.query(
                    `INSERT INTO variants (product_id, color, size, style) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [id, comb.Color || '', comb.Size || '', comb.Style || '']
                );
                const variant_id = variantResult.rows[0].id;
                const filesKey = `comb_images_${i}`;
                const rowFiles = req.files ? req.files.filter(f => f.fieldname === filesKey) : [];
                if (Array.isArray(rowFiles)) {
                    for (const file of rowFiles) {
                        const imgUrl = `/uploads/${file.filename}`;
                        await pool.query(`INSERT INTO variant_images (product_id, variant_id, image_url) VALUES ($1, $2, $3)`, [id, variant_id, imgUrl]);
                    }
                }
            }
        }

        res.status(200).json({ success: true, message: 'Product updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM product_details WHERE id = $1`, [id]);
        await pool.query(`DELETE FROM features WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM specifications WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM variants WHERE product_id = $1`, [id]);
        await pool.query(`DELETE FROM variant_images WHERE product_id = $1`, [id]);
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
};

const deleteSpecLabel = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM spec_label WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: 'Detailed Specification Label successfully deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
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
    updateProduct
};
