const fs = require('fs');
const content = fs.readFileSync('c:/Tortox/frontend/src/components/product.jsx', 'utf8');

let stack = [];
const regex = /<(div|form|motion\.div|AnimatePresence)|<\/(div|form|motion\.div|AnimatePresence)>/g;
let match;
while ((match = regex.exec(content)) !== null) {
    if (match[1]) {
        stack.push({ type: match[1], line: content.substring(0, match.index).split('\n').length });
    } else {
        const last = stack.pop();
        if (!last) {
            console.log(`Extra Close </${match[2]}> at line ${content.substring(0, match.index).split('\n').length}`);
        } else if (last.type !== match[2]) {
            console.log(`Mismatch! Opened <${last.type}> at line ${last.line}, closed with </${match[2]}> at line ${content.substring(0, match.index).split('\n').length}`);
            // Push back to keep stack logic
            stack.push(last);
        }
    }
}
console.log(`Final stack: ${JSON.stringify(stack)}`);
