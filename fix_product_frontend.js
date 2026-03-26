const fs = require('fs');

const targetFile = 'c:\\Tortox\\frontend\\src\\components\\product.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

const anchorStart = '{comb.previews && comb.previews.map((preview, i) => (';
const anchorEnd = '))}';

const startIdx = content.indexOf(anchorStart);
if (startIdx !== -1) {
    const endIdx = content.indexOf(anchorEnd, startIdx);
    if (endIdx !== -1) {
        const replacement = `<Reorder.Group axis="x" values={comb.previews || []} onReorder={(newOrder) => {
                                                                     const newComb = [...combinations];
                                                                     // Reorder both previews and variantFiles simultaneously
                                                                     // to keep them perfectly in sync node flawless flaws
                                                                     const mappedFiles = [];
                                                                     newOrder.forEach((url) => {
                                                                         const idx = (newComb[index].previews || []).indexOf(url);
                                                                         if (idx !== -1 && newComb[index].variantFiles && newComb[index].variantFiles[idx]) {
                                                                             mappedFiles.push(newComb[index].variantFiles[idx]);
                                                                         } else {
                                                                             mappedFiles.push(null);
                                                                         }
                                                                     });
                                                                     newComb[index].previews = newOrder;
                                                                     newComb[index].variantFiles = mappedFiles;
                                                                     setCombinations(newComb);
                                                                 }} style={{ display: 'flex', gap: '10px', listStyle: 'none', padding: 0, margin: 0, flexWrap: 'wrap' }}>
                                                                     {(comb.previews || []).map((preview, i) => (
                                                                         <Reorder.Item key={preview} value={preview} style={{ position: 'relative', cursor: 'grab' }} whileDrag={{ scale: 1.1, zIndex: 50 }}>
                                                                             <img src={preview} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                                                             <button type="button" onClick={() => {
                                                                                 const newComb = [...combinations];
                                                                                 newComb[index].previews = newComb[index].previews.filter((_, idx) => idx !== i);
                                                                                 newComb[index].variantFiles = (newComb[index].variantFiles || []).filter((_, idx) => idx !== i);
                                                                                 setCombinations(newComb);
                                                                             }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={10} /></button>
                                                                         </Reorder.Item>
                                                                     ))}
                                                                 </Reorder.Group>`;
                                                                 
        content = content.slice(0, startIdx) + replacement + content.slice(endIdx + anchorEnd.length);
        fs.writeFileSync(targetFile, content, 'utf8');
        console.log('Successfully replaced Variant Images with Reorder.Group!');
    } else {
        console.log('Anchor end not found');
    }
} else {
    // Retry with spaces if it missed
    const anchorStartAlternative = '{comb.previews &&\\s*comb\\.previews\\.map';
    console.log('Anchor start not found');
}
