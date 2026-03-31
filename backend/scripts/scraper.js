const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const urls = [
    'http://www.tortox.com/products/shadow.php', 'http://www.tortox.com/products/shadowv2.php',
    'http://www.tortox.com/products/nova.php', 'http://www.tortox.com/products/magnus.php',
    'http://www.tortox.com/products/neon.php', 'http://www.tortox.com/products/alpha.php',
    'http://www.tortox.com/products/spectra.php', 'http://www.tortox.com/products/luna.php',
    'http://www.tortox.com/products/ninja.php', 'http://www.tortox.com/products/ninja3.php',
    'http://www.tortox.com/products/spark.php', 'http://www.tortox.com/products/spark3.php',
    'http://www.tortox.com/products/arcus.php', 'http://www.tortox.com/products/liqwi1.php',
    'http://www.tortox.com/products/liqwi2.php', 'http://www.tortox.com/products/freeze1.php'
];

async function scrapeAndLoad() {
    console.log('--- STARTING SCRAPE FOR', urls.length, 'URLS ---');
    for (const url of urls) {
        try {
            console.log('FETCHING:', url);
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            const modal = $('h1').first().text().trim().replace(/^TORTOX\s+/, '');
            const description = $('.m_content p').first().text().trim() || $('.m_content div').first().text().trim();
            
            // Image discovery: look for prominent product images
            const images = [];
            $('img').each((i, el) => {
                const src = $(el).attr('src');
                if (src && (src.toLowerCase().includes('product') || src.toLowerCase().includes('cases'))) {
                    const fullUrl = src.startsWith('http') ? src : `http://www.tortox.com/${src.replace(/^\//, '')}`;
                    if (!images.includes(fullUrl)) images.push(fullUrl);
                }
            });

            // Specs and Features
            const specs = [];
            const features = [];

            $('h4').each((i, el) => {
                const section = $(el).text().toLowerCase();
                const text = $(el).nextUntil('h4, h3, h2, hr').text();
                const listItems = $(el).nextUntil('h4, h3, h2, hr').find('li');

                const lines = listItems.length > 0 
                    ? listItems.map((_, li) => $(li).text()).get()
                    : text.split('\n').map(l => l.trim()).filter(l => l.includes(':') || l.startsWith('-'));

                lines.forEach(line => {
                    const cleaned = line.replace(/^- /, '').trim();
                    if (cleaned.includes(':')) {
                        const [key, val] = cleaned.split(':');
                        specs.push({ label: key.trim(), value: val.trim() });
                    } else if (cleaned) {
                        features.push(cleaned);
                    }
                });
            });

            // Category guessing
            let categoryId = 1; // Default Cases
            if (url.includes('liqwi') || url.includes('freeze')) categoryId = 3; // Liquid Cooler

            // 💾 INSERT INTO DATABASE
            const prodRes = await pool.query(
                `INSERT INTO product_details (category_id, modal, product_name, product_description, image) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [categoryId, modal, modal, description.substring(0, 1000), images[0] || null]
            );
            const productId = prodRes.rows[0].id;

            // Features
            for (const f of features.slice(0, 10)) {
                await pool.query('INSERT INTO features (product_id, category_id, features) VALUES ($1, $2, $3)', [productId, categoryId, f]);
            }

            // Specs
            for (const s of specs) {
                await pool.query(
                    'INSERT INTO specifications (product_id, category_id, specification_name, specification_value) VALUES ($1, $2, $3, $4)',
                    [productId, categoryId, s.label, s.value]
                );
            }

            // Images
            for (const img of images.slice(0, 5)) {
                await pool.query('INSERT INTO product_images (product_id, image_path) VALUES ($1, $2)', [productId, img]);
            }

            console.log('✅ LOADED:', modal, 'with', specs.length, 'specs and', images.length, 'images.');

        } catch (err) {
            console.error('❌ FAILED URL:', url, err.message);
        }
    }
    console.log('--- DATA INGESTION COMPLETE ---');
    process.exit(0);
}

scrapeAndLoad();
