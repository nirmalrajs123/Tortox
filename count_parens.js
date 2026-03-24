const fs = require('fs');
const content = fs.readFileSync('c:\\Tortox\\frontend\\src\\components\\product.jsx', 'utf8');
let parenCount = 0;
let braceCount = 0;
content.split('\n').forEach((line, idx) => {
    for (let char of line) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
    }
});
console.log(`Paren outstanding: ${parenCount}`);
console.log(`Brace outstanding: ${braceCount}`);
