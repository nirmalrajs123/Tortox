const express = require('express');
const router = express.Router();
const {
    getProducts, getProductById, getCategories, addProduct, getSpecLabels, addSpecLabel, deleteSpecLabel,
    deleteProduct, updateProduct, getFilterLabels, addFilterLabel, deleteFilterLabel,
    getFilterValues, addFilterValue, deleteFilterValue, getFilterConfig, saveFullFilter,
    updateFilterLabel, updateFilterValue
} = require('../controllers/productController');
const upload = require('../utils/multerConfig');

// Dynamic Filters Config (MOVE TO TOP TO ENSURE NO 404)
router.get('/filter-labels/:category_id', getFilterLabels);
router.post('/filter-labels', addFilterLabel);
router.delete('/filter-labels/:id', deleteFilterLabel);
router.put('/filter-labels/:id', updateFilterLabel);
router.get('/filter-values/:label_id', getFilterValues);
router.post('/filter-values', addFilterValue);
router.delete('/filter-values/:id', deleteFilterValue);
router.put('/filter-values/:id', updateFilterValue);
router.get('/filter-config/:category_id', getFilterConfig);
router.post('/save-full-filter', saveFullFilter);

// Categories
router.get('/categories', getCategories);

// Other Routes
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/product-by-slug/:slug', getProductById);
router.get('/spec-labels/:category_id', getSpecLabels);
router.post('/spec-labels', addSpecLabel);
router.post('/products', upload.any(), addProduct);
router.put('/products/:id', upload.any(), updateProduct);
router.delete('/spec-labels/:id', deleteSpecLabel);
router.delete('/products/:id', deleteProduct);

module.exports = router;
