const express = require('express');
const router = express.Router();
const {
    getProducts, getProductById, getCategories, addProduct, getSpecLabels, addSpecLabel, deleteSpecLabel,
    deleteProduct, updateProduct, getFilterLabels, addFilterLabel, deleteFilterLabel,
    getFilterValues, addFilterValue, deleteFilterValue, getFilterConfig, saveFullFilter,
    updateFilterLabel, updateFilterValue, toggleProductHot, toggleProductNew, toggleProductActive, updateFilterLabelOrder, updateFilterValueOrder
} = require('../controllers/productController');
const upload = require('../utils/multerConfig');

// 🔥 PRIORITY STATUS TOGGLES (STRICT TOP-LEVEL REGISTRATION)
router.put('/products/:id/toggle-hot', toggleProductHot);
router.put('/products/:id/toggle-new', toggleProductNew);
router.put('/products/:id/toggle-active', toggleProductActive);

// Dynamic Filters Config
router.put('/reorder-filters', updateFilterLabelOrder);
router.put('/reorder-filter-values', updateFilterValueOrder);
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

// Categories consolidated in categoryRoutes

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
