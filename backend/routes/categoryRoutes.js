const express = require('express');
const router = express.Router();
const { getCategories, addCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

// @route   GET /api/categories
// @desc    Fetch all categories
router.get('/categories', getCategories);

// @route   POST /api/categories
// @desc    Create a category
router.post('/categories', addCategory);

// @route   PUT /api/categories/:id
// @desc    Update a category
router.put('/categories/:id', updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
router.delete('/categories/:id', deleteCategory);

module.exports = router;
