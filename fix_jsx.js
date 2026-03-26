const fs = require('fs');
const path = 'c:/Tortox/frontend/src/components/product.jsx';
let content = fs.readFileSync(path, 'utf8').split('\n');

// 1. Remove line 1087 (1086-indexed) and 1088 (1087-indexed)
// Wait! Let's search exactly for what we saw:
// 1085:                                 </div>
// 1086:                             </div>
// 1087: </button>
// 1088:                                 </div>
// 1089:                             </div>

// We'll splice them out.
content.splice(1086, 3); // removes 1087, 1088, 1089

// 2. Remove the extra </AnimatePresence> (1098 from the original file, now 1095)
content = content.filter((line, idx) => {
    if (line.trim() === '</AnimatePresence>' && (idx === 1094 || idx === 1093)) return false; 
    return true;
});

// Actually, we'll just fix the end manually using a more robust regex-like approach if possible.
// Let's just write the lines back with a basic fix.
fs.writeFileSync(path, content.join('\n'));
console.log('Fixed lines.');
