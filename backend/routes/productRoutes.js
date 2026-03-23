const express = require('express');
const router = express.Router();
const { getProducts, addProduct } = require('../controllers/productController');
const upload = require('../utils/multerConfig');

router.get('/products', getProducts);
router.post('/products', upload.any(), addProduct);

module.exports = router;
