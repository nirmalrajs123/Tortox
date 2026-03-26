const fs = require('fs');
const path = 'c:/Tortox/frontend/src/components/product.jsx';
let content = fs.readFileSync(path, 'utf8');

// Use a more flexible approach to replace the Specs Reorder.Item
const startMarker = '<Reorder.Item key={s.id} value={s}';
const endMarker = 'placeholder={`Enter ${s.label}...`}';

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
    // Find the end of the matching </Reorder.Item>
    const nextItemIndex = content.indexOf('</Reorder.Item>', startIndex);
    if (nextItemIndex !== -1) {
        const fullOldItem = content.substring(startIndex, nextItemIndex);
        
        // Reconstruct the new item string with robust drag support
        const newReorderItem = `<Reorder.Item 
                                                    key={s.id} 
                                                    value={s} 
                                                    whileDrag={{ scale: 1.01, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', cursor: 'grabbing', zIndex: 100 }}
                                                    style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'grab' }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <GripVertical size={16} color="var(--text-muted)" style={{ cursor: 'move', touchAction: 'none' }} />
                                                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase' }}>{s.label}</label>
                                                            </div>
                                                            <button type="button" onClick={() => {
                                                                if (window.confirm(\`Permanently remove "\${s.label}" field for all variants and this category?\`)) {
                                                                    handleDeleteSpecLabel(s.id);
                                                                }
                                                            }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={s.value}
                                                            onChange={(e) => {
                                                                const newComb = [...combinations];
                                                                const spIdx = newComb[editingVariantIdx].specs.findIndex(sp => sp.id === s.id);
                                                                if (spIdx !== -1) {
                                                                    newComb[editingVariantIdx].specs[spIdx].value = e.target.value;
                                                                    setCombinations(newComb);
                                                                }
                                                            }}
                                                            style={{ ...inputStyle, background: 'var(--bg-primary)', border: '1px solid var(--border)', margin: 0 }}
                                                            placeholder={\`Enter \${s.label}...\`}
                                                        />
                                                    </div>`;
        
        const finalContent = content.substring(0, startIndex) + newReorderItem + content.substring(nextItemIndex);
        fs.writeFileSync(path, finalContent);
        console.log('Fixed Reorder implementation successfully.');
    }
} else {
    console.log('Could not find start marker.');
}
