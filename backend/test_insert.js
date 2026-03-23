const axios = require('axios');
const FormData = require('form-data');

async function run() {
    const form = new FormData();
    form.append('category_id', '1');
    form.append('modal', 'CAB-TEST-V4');
    form.append('modal_name', 'Test Name');
    form.append('product_name', 'Test Product');
    form.append('specifications', JSON.stringify([
        { specification_name: 'Test Spec label', specification_value: 'Testing val', order_id: 1 }
    ]));

    try {
        const res = await axios.post('http://localhost:5000/api/products', form, {
            headers: form.getHeaders()
        });
        console.log("Response:", res.data);
    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    }
}
run();
