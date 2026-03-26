const fs = require('fs');
const path = 'c:/Tortox/frontend/src/components/product.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update Features initialization in handleAddCombination (if it exists)
// Actually I'll just change the render logic first to be safe.

// 2. Fix Highlights Reorder items
const featureRowStart = '{(combinations[editingVariantIdx].features || []).map((feat, featIdx) => (';
const featureRowEnd = '</Reorder.Item>';

const fStartIndex = content.indexOf(featureRowStart);
if (fStartIndex !== -1) {
    const fNextIndex = content.indexOf(featureRowEnd, fStartIndex);
    if (fNextIndex !== -1) {
        const newFeatureItem = `{(combinations[editingVariantIdx].features || []).map((feat, featIdx) => (
                                                <Reorder.Item 
                                                    key={\`\${featIdx}-\${feat}\`} 
                                                    value={feat} 
                                                    whileDrag={{ scale: 1.01, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', cursor: 'grabbing', zIndex: 100 }}
                                                    style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '14px', border: '1px solid var(--border)', cursor: 'grab' }}
                                                >
                                                    <GripVertical size={16} color="var(--text-muted)" style={{ cursor: 'move', touchAction: 'none' }} />
                                                    <input
                                                        type="text"
                                                        placeholder="Feature bullet point..."
                                                        value={feat}
                                                        onChange={(e) => {
                                                            const newComb = [...combinations];
                                                            newComb[editingVariantIdx].features[featIdx] = e.target.value;
                                                            setCombinations(newComb);
                                                        }}
                                                        style={{ ...inputStyle, padding: '12px 16px', fontSize: '0.95rem', background: 'transparent', border: 'none', flex: 1, margin: 0 }}
                                                    />
                                                    <button type="button" onClick={() => {
                                                        const newComb = [...combinations];
                                                        newComb[editingVariantIdx].features = newComb[editingVariantIdx].features.filter((_, i) => i !== featIdx);
                                                        setCombinations(newComb);
                                                    }} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={16} /></button>`;
        
        content = content.substring(0, fStartIndex) + newFeatureItem + content.substring(fNextIndex);
    }
}

fs.writeFileSync(path, content);
console.log('Fixed Highlights Reorder implementation successfully.');
