const fs = require('fs');
const path = 'c:/Tortox/frontend/src/components/product.jsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Line 735-756 is approximately where the filters are.
// Using exact match for the broken part and the surround

const startMarker = "<p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e11919', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filters</p>";
const endMarker = "{/* --- Variant Features --- */}";

const startIdx = lines.findIndex(l => l.includes(startMarker));
const endIdx = lines.findIndex(l => l.includes(endMarker));

if (startIdx !== -1 && endIdx !== -1) {
    // Replace everything from startMarker parent DIV to just before endMarker
    // We'll replace lines from startIdx-1 (the <div>) to endIdx-1
    const newBlock = `                                                                                     <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e11919', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filters</p>
                                                                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                                                                         {(filtersList || []).map((f) => {
                                                                                             const vFilter = (comb.filters || []).find(vf => vf.id === f.id);
                                                                                             return (
                                                                                                 <div key={f.id}>
                                                                                                     <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>{f.label}</label>
                                                                                                     <select
                                                                                                         value={vFilter ? vFilter.value : ''}
                                                                                                         onChange={(e) => {
                                                                                                             const newComb = [...combinations];
                                                                                                             if (!newComb[index].filters) newComb[index].filters = [];
                                                                                                             const vfIdx = newComb[index].filters.findIndex(vf => vf.id === f.id);
                                                                                                             if (vfIdx !== -1) {
                                                                                                                 newComb[index].filters[vfIdx].value = e.target.value;
                                                                                                             } else {
                                                                                                                 newComb[index].filters.push({ id: f.id, value: e.target.value });
                                                                                                             }
                                                                                                             setCombinations(newComb);
                                                                                                         }}
                                                                                                         style={{ ...inputStyle, padding: '6px 10px', fontSize: '0.78rem', marginTop: 0 }}
                                                                                                     >
                                                                                                         <option value="">-- Select --</option>
                                                                                                         {(f.options || []).map(opt => (
                                                                                                             <option key={opt.id} value={opt.filter_value}>{opt.filter_value}</option>
                                                                                                         ))}
                                                                                                     </select>
                                                                                                 </div>
                                                                                             );
                                                                                         })}
                                                                                     </div>
                                                                                 </div>`;
    // We replace lines [startIdx, endIdx-1]
    lines.splice(startIdx, endIdx - startIdx, newBlock);
    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    console.log("Successfully fixed filters block.");
} else {
    console.log("Could not find markers.", startIdx, endIdx);
}
