const express = require('express');
const router = express.Router();
const { 
    getAPlusContent, 
    addAPlusContent, 
    updateAPlusContent, 
    deleteAPlusContent 
} = require('../controllers/aplusController');
const upload = require('../utils/multerConfig');

router.get('/aplus/:productId', getAPlusContent);
router.post('/aplus', upload.any(), addAPlusContent);
router.put('/aplus/:id', updateAPlusContent);
router.delete('/aplus/:id', deleteAPlusContent);

module.exports = router;
