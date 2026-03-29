const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Tortox/backend/.env' });
const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
});
async function seedCurvo() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const catRes = await client.query("SELECT id FROM categorys WHERE category_name ILIKE '%CASE%' LIMIT 1");
        const categoryId = catRes.rows[0]?.id || 1;
        const description = `The Tortox Curvo Gaming PC Case offers a sleek and modern design with a curved front panel that enhances its sophisticated appearance. It comes pre-installed with seven 120MM ARGB PWM fans, ensuring both an aesthetic look and superior airflow. This gaming case supports ATX, M-ATX, and M-ITX motherboards, providing versatile compatibility for various builds. For efficient cooling, it is compatible with a 360MM liquid cooler and can accommodate up to ten 120MM case fans. Constructed from durable 0.7MM SPCC material, this gaming case is designed to deliver both performance and durability.`;

        const specsJson = JSON.stringify({
            dimensions: { value: '460 x 285 x 398 mm' },
            material: { value: '0.7mm SPCC, Tempered Glass' },
            gpu_clearance: { value: '445MM' },
            cpu_clearance: { value: '160MM' },
            radiator: { value: 'Top 360/280/240, Side 240/120, Rear 120' }
        });

        const productRes = await client.query(`
            INSERT INTO product_details (category_id, modal, product_name, product_description, mb_compat, image, hover_image, specs)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [
            categoryId, 'CURVO', 'TORTOX CURVO', description, 'ATX, M-ATX, ITX', 
            'http://tortox.com/images/products/curvo/1.png', 
            'http://tortox.com/images/products/curvo/2.png',
            specsJson
        ]);

        const productId = productRes.rows[0].id;
        const features = ["Pre Installed 7*120MM ARGB PWM Case fans", "Curved panel design", "360MM liquid cooler support", "Type-C port support", "10*120MM case fans compatible"];
        for (const f of features) await client.query("INSERT INTO features (product_id, category_id, features) VALUES ($1, $2, $3)", [productId, categoryId, f]);
        
        const specs = [
            {n:'Motherboard Support',v:'ATX, M-ATX, ITX'}, 
            {n:'Dimensions',v:'460mm x 285mm x 398mm'},
            {n:'GPU Clearance',v:'445 MM'},
            {n:'CPU Clearance',v:'160 MM'},
            {n:'Case Material',v:'0.7mm SPCC, Tempered Glass'}
        ];
        for (const s of specs) await client.query("INSERT INTO specifications (product_id, category_id, specification_name, specification_value) VALUES ($1, $2, $3, $4)", [productId, categoryId, s.n, s.v]);

        const images = [
            'http://tortox.com/images/products/curvo/1.png',
            'http://tortox.com/images/products/curvo/2.png',
            'http://tortox.com/images/products/curvo/3.png',
            'http://tortox.com/images/products/curvo/4.png',
            'http://tortox.com/images/products/curvo/5.png',
            'http://tortox.com/images/products/curvo/6.png'
        ];
        for (const img of images) await client.query("INSERT INTO product_images (product_id, image_path, image_type) VALUES ($1, $2, $3)", [productId, img, 'gallery']);

        await client.query('COMMIT');
        console.log("Successfully inserted TORTOX CURVO into tactical data relay!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("DATABASE ERROR:", e);
    } finally { client.release(); await pool.end(); }
}
seedCurvo();
