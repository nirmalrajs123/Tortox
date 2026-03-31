const axios = require('axios');
async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/products/tortox-bx600');
        const prod = res.data.data;
        console.log('--- VARIANTS TEST ---');
        console.log('Combinations Count:', prod.combinations.length);
        prod.combinations.forEach(v => {
            console.log('Variant ID:', v.id, 'Specs Count:', v.specs ? v.specs.length : 0);
        });
        console.log('--- GLOBAL SPECS ---');
        console.log('Specifications Count:', prod.specifications.length);
    } catch(e) { console.error(e.message); }
}
test();
