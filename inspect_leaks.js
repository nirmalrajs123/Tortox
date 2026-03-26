const fs = require('fs');
const path = require('path');

const dir = 'c:\\Tortox\\backend\\controllers';
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const connectCount = (content.match(/pool\.connect\(\)/g) || []).length;
        const releaseCount = (content.match(/client\.release\(\)/g) || []).length;
        if (connectCount !== releaseCount) {
            console.log(`[Leak Risk] ${file}: ${connectCount} connects vs ${releaseCount} releases`);
        } else {
            console.log(`${file}: OK`);
        }
    }
});
