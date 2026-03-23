import axios from 'axios';

const run = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/products', {
            category_id: 1,
            product_name: "Test product",
            specifications: [{ specification_name: "Weight", specification_value: "2kg" }]
        });
        console.log("✅ Success response:", response.data);
    } catch (err) {
        if (err.response) {
            console.error("❌ Error response:", err.response.data);
        } else {
            console.error("❌ Error response:", err.message);
        }
    }
};
run();
