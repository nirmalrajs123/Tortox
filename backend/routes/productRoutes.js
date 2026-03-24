const express = require('express');
const router = express.Router();
const { getProducts, getProductById, addProduct, getSpecLabels, addSpecLabel, deleteSpecLabel, deleteProduct, updateProduct } = require('../controllers/productController');
const upload = require('../utils/multerConfig');

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/spec-labels/:category_id', getSpecLabels);
router.post('/spec-labels', addSpecLabel);
router.post('/products', upload.any(), addProduct);
router.put('/products/:id', upload.any(), updateProduct);
router.delete('/spec-labels/:id', deleteSpecLabel);
router.delete('/products/:id', deleteProduct);

module.exports = router;
