const express = require('express');
const router = express.Router();
const {
    getAllBanners,
    addBanner,
    updateBanner,
    deleteBanner
} = require('../controllers/bannerController');
const upload = require('../utils/multerConfig');

router.get('/banners', getAllBanners);
router.post('/banners', upload.any(), addBanner);
router.put('/banners/:id', upload.any(), updateBanner);
router.delete('/banners/:id', deleteBanner);

module.exports = router;
