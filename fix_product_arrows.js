const fs = require('fs');

const targetFile = 'c:\\Tortox\\frontend\\src\\components\\product.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

const anchorStart = '{(comb.previews || []).map((preview, i) => (';
const anchorEnd = '</Reorder.Item>';

const startIdx = content.indexOf(anchorStart);
if (startIdx !== -1) {
    const endIdx = content.indexOf(anchorEnd, startIdx);
    if (endIdx !== -1) {
        const replacement = `{(comb.previews || []).map((preview, i) => (
                                                                         <Reorder.Item key={preview} value={preview} style={{ position: 'relative', cursor: 'grab' }} whileDrag={{ scale: 1.1, zIndex: 50 }}>
                                                                             <img src={preview} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                                                             
                                                                             {/* 🔁 Swap Left */}
                                                                             {i > 0 && (
                                                                                 <button type="button" onClick={() => {
                                                                                     const newComb = [...combinations];
                                                                                     const prev = [...newComb[index].previews];
                                                                                     const files = [...(newComb[index].variantFiles || [])];
                                                                                     [prev[i], prev[i - 1]] = [prev[i - 1], prev[i]];
                                                                                     if (files[i] !== undefined && files[i - 1] !== undefined) {
                                                                                         [files[i], files[i - 1]] = [files[i - 1], files[i]];
                                                                                     }
                                                                                     newComb[index].previews = prev;
                                                                                     newComb[index].variantFiles = files;
                                                                                     setCombinations(newComb);
                                                                                 }} style={{ position: 'absolute', bottom: '-4px', left: '-4px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, fontSize: '10px' }}>←</button>
                                                                             )}

                                                                             {/* 🔁 Swap Right */}
                                                                             {i < (comb.previews || []).length - 1 && (
                                                                                 <button type="button" onClick={() => {
                                                                                     const newComb = [...combinations];
                                                                                     const prev = [...newComb[index].previews];
                                                                                     const files = [...(newComb[index].variantFiles || [])];
                                                                                     [prev[i], prev[i + 1]] = [prev[i + 1], prev[i]];
                                                                                     if (files[i] !== undefined && files[i + 1] !== undefined) {
                                                                                         [files[i], files[i + 1]] = [files[i + 1], files[i]];
                                                                                     }
                                                                                     newComb[index].previews = prev;
                                                                                     newComb[index].variantFiles = files;
                                                                                     setCombinations(newComb);
                                                                                 }} style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, fontSize: '10px' }}>→</button>
                                                                             )}

                                                                             <button type="button" onClick={() => {
                                                                                 const newComb = [...combinations];
                                                                                 newComb[index].previews = newComb[index].previews.filter((_, idx) => idx !== i);
                                                                                 newComb[index].variantFiles = (newComb[index].variantFiles || []).filter((_, idx) => idx !== i);
                                                                                 setCombinations(newComb);
                                                                             }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={10} /></button>
                                                                         </Reorder.Item>`;
        content = content.slice(0, startIdx) + replacement + content.slice(endIdx + anchorEnd.length);
        fs.writeFileSync(targetFile, content, 'utf8');
        console.log('Successfully added Swap Arrows Overlay!');
    } else {
        console.log('Anchor end not found');
    }
} else {
    console.log('Anchor start not found');
}
