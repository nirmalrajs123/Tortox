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
                        `INSERT INTO specifications (product_id, specification_name, specification_value, order_id) VALUES ($1, $2, $3, $4)`,
                        [product_id, spec.specification_name, spec.specification_value, spec.order_id || null]
                    );
                }
            }
        }

        // 3. Expand Dynamic Case specifications to Table with ordering flaws flawlessly layout:
        if (specs && typeof specs === 'object') {
            for (const key in specs) {
                const item = specs[key]; // Item holds { value: '..', order: 1, label: '..' }
                if (item && item.value && item.value.trim() !== '' && item.label) {
                    await pool.query(
                        `INSERT INTO specifications (product_id, specification_name, specification_value, order_id) VALUES ($1, $2, $3, $4)`,
                        [product_id, item.label, item.value, item.order || null]
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

module.exports = {
    getProducts,
    addProduct
};
