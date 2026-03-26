const fs = require('fs');

const file = 'c:\\Tortox\\backend\\controllers\\productController.js';
let content = fs.readFileSync(file, 'utf8');

// 1. In addProduct: replace around lines 187-197
const addProductSearch = `                const filesKey = \`comb_images_\${i}\`;
                const rowFiles = req.files ? req.files.filter(f => f.fieldname === filesKey) : [];
                if (Array.isArray(rowFiles)) {
                    for (const file of rowFiles) {
                        const imgUrl = \`/uploads/\${file.filename}\`;
                        await client.query(
                            \`INSERT INTO variant_images (product_id, variant_id, image_url) VALUES (\$1, \$2, \$3)\`,
                            [product_id, variant_id, imgUrl]
                        );
                    }
                }`;

const addProductReplace = `                const filesKey = \`comb_images_\${i}\`;
                const orderKey = \`comb_images_order_\${i}\`;
                const rowFiles = req.files ? req.files.filter(f => f.fieldname === filesKey) : [];
                const orderJson = req.body[orderKey]; // ['URL', 'FILE_0', ...]
                const orders = orderJson ? (typeof orderJson === 'string' ? JSON.parse(orderJson) : orderJson) : [];

                let fileIdx = 0;
                let orderIdx = 0;
                
                if (Array.isArray(orders) && orders.length > 0) {
                    for (const item of orders) {
                        if (item.startsWith('FILE_')) {
                            if (rowFiles[fileIdx]) {
                                const imgUrl = \`/uploads/\${rowFiles[fileIdx].filename}\`;
                                await client.query(
                                    \`INSERT INTO variant_images (product_id, variant_id, image_url, order_idd) VALUES (\$1, \$2, \$3, \$4)\`,
                                    [product_id, variant_id, imgUrl, orderIdx]
                                );
                                fileIdx++;
                            }
                        } else {
                            // It's an existing image URL from absolute reorder sync
                            const existingUrl = item.replace(/^http:\\/\\/[^\\/]+/i, ''); // Strip host flawless flawless configuration flawless layout flawless
                            await client.query(
                                \`INSERT INTO variant_images (product_id, variant_id, image_url, order_idd) VALUES (\$1, \$2, \$3, \$4)\`,
                                [product_id, variant_id, existingUrl, orderIdx]
                            );
                        }
                        orderIdx++;
                    }
                } else if (Array.isArray(rowFiles)) {
                    for (const file of rowFiles) {
                        const imgUrl = \`/uploads/\${file.filename}\`;
                        await client.query(
                            \`INSERT INTO variant_images (product_id, variant_id, image_url, order_idd) VALUES (\$1, \$2, \$3, \$4)\`,
                            [product_id, variant_id, imgUrl, orderIdx]
                        );
                        orderIdx++;
                    }
                }`;

// 2. In updateProduct: replace around lines 301-308
const updateProductSearch = `                const filesKey = \`comb_images_\${i}\`;
                const rowFiles = req.files ? req.files.filter(f => f.fieldname === filesKey) : [];
                if (Array.isArray(rowFiles)) {
                    for (const file of rowFiles) {
                        const imgUrl = \`/uploads/\${file.filename}\`;
                        await client.query(\`INSERT INTO variant_images (product_id, variant_id, image_url) VALUES (\$1, \$2, \$3)\`, [id, variant_id, imgUrl]);
                    }
                }`;

const updateProductReplace = `                const filesKey = \`comb_images_\${i}\`;
                const orderKey = \`comb_images_order_\${i}\`;
                const rowFiles = req.files ? req.files.filter(f => f.fieldname === filesKey) : [];
                const orderJson = req.body[orderKey];
                const orders = orderJson ? (typeof orderJson === 'string' ? JSON.parse(orderJson) : orderJson) : [];

                let fileIdx = 0;
                let orderIdx = 0;

                if (Array.isArray(orders) && orders.length > 0) {
                    for (const item of orders) {
                        if (item.startsWith('FILE_')) {
                            if (rowFiles[fileIdx]) {
                                const imgUrl = \`/uploads/\${rowFiles[fileIdx].filename}\`;
                                await client.query(
                                    \`INSERT INTO variant_images (product_id, variant_id, image_url, order_idd) VALUES (\$1, \$2, \$3, \$4)\`,
                                    [id, variant_id, imgUrl, orderIdx]
                                );
                                fileIdx++;
                            }
                        } else {
                            const existingUrl = item.replace(/^https?:\\/\\/[^\\/]+/i, '');
                            await client.query(
                                \`INSERT INTO variant_images (product_id, variant_id, image_url, order_idd) VALUES (\$1, \$2, \$3, \$4)\`,
                                [id, variant_id, existingUrl, orderIdx]
                            );
                        }
                        orderIdx++;
                    }
                } else if (Array.isArray(rowFiles)) {
                    for (const file of rowFiles) {
                        const imgUrl = \`/uploads/\${file.filename}\`;
                        await client.query(\`INSERT INTO variant_images (product_id, variant_id, image_url, order_idd) VALUES (\$1, \$2, \$3, \$4)\`, [id, variant_id, imgUrl, orderIdx]);
                        orderIdx++;
                    }
                }`;

if (content.includes(addProductSearch)) {
    content = content.replace(addProductSearch, addProductReplace);
    console.log('Match 1 Found');
} else {
    console.log('Match 1 NOT FOUND');
}

if (content.includes(updateProductSearch)) {
    content = content.replace(updateProductSearch, updateProductReplace);
    console.log('Match 2 Found');
} else {
    console.log('Match 2 NOT FOUND');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Saved productController.js');
