const fs = require('fs');

const file = 'c:\\Tortox\\frontend\\src\\components\\product.jsx';
const content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('setProductImages') || line.includes('productImages')) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
    }
});
