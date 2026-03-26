const express = require('express');
const router = express.Router();
const {
    getProducts, getProductById, addProduct, getSpecLabels, addSpecLabel, deleteSpecLabel,
    deleteProduct, updateProduct, getFilterLabels, addFilterLabel, deleteFilterLabel,
    getFilterValues, addFilterValue, deleteFilterValue, getFilterConfig, saveFullFilter
} = require('../controllers/productController');
const upload = require('../utils/multerConfig');

// Dynamic Filters Config (MOVE TO TOP TO ENSURE NO 404)
router.get('/filter-labels/:category_id', getFilterLabels);
router.post('/filter-labels', addFilterLabel);
router.delete('/filter-labels/:id', deleteFilterLabel);
router.get('/filter-values/:label_id', getFilterValues);
router.post('/filter-values', addFilterValue);
router.delete('/filter-values/:id', deleteFilterValue);
router.get('/filter-config/:category_id', getFilterConfig);
router.post('/save-full-filter', saveFullFilter);

// Other Routes
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/spec-labels/:category_id', getSpecLabels);
router.post('/spec-labels', addSpecLabel);
router.post('/products', upload.any(), addProduct);
router.put('/products/:id', upload.any(), updateProduct);
router.delete('/spec-labels/:id', deleteSpecLabel);
router.delete('/products/:id', deleteProduct);

module.exports = router;
