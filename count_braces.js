const fs = require('fs');
const content = fs.readFileSync('c:\\Tortox\\frontend\\src\\components\\product.jsx', 'utf8');
let openCount = 0;
content.split('\n').forEach((line, idx) => {
    for (let char of line) {
        if (char === '{') openCount++;
        if (char === '}') openCount--;
    }
    if (openCount < 0) {
        console.log(`Mismatch (underflow) on line ${idx + 1}`);
        openCount = 0;
    }
});
console.log(`Total outstanding: ${openCount}`);
