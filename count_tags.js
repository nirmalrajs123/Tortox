const fs = require('fs');
const content = fs.readFileSync('c:\\Tortox\\frontend\\src\\components\\product.jsx', 'utf8');
const openTags = [];
let idx = 0;
while (idx < content.length) {
    if (content.startsWith('<', idx) && content[idx+1] !== ' ' && content[idx+1] !== '=' && content[idx+1] !== '!') {
        let tagEnd = content.indexOf('>', idx);
        if (tagEnd > -1) {
            let tagContent = content.substring(idx + 1, tagEnd).trim().split(' ')[0];
            if (content[idx+1] === '/') {
                let closeTag = tagContent.substring(1).trim();
                if (openTags.length > 0) {
                    let lastOpen = openTags.pop();
                    if (lastOpen !== closeTag) {
                        console.log(`Mismatch! Close </${closeTag}> doesn't match open <${lastOpen}>`);
                        openTags.push(lastOpen); // restore
                    }
                } else {
                    console.log(`Dangling close tag: </${closeTag}>`);
                }
            } else if (!content.substring(idx+1, tagEnd+1).includes('/>')) {
                if (!tagContent.startsWith('!--') && !tagContent.startsWith('!')) {
                    openTags.push(tagContent);
                }
            }
            idx = tagEnd;
        }
    }
    idx++;
}
console.log("Remaining open tags:", openTags);
