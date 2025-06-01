const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const businessController = require('../controllers/businessController');
const upload = require('../middleware/upload');

// İşletme ayarlarını alma
router.get('/settings', protect, businessController.getBusinessSettings);

// İşletme ayarlarını güncelleme
router.put('/settings', protect, businessController.updateBusinessSettings);

// İşletme resmi yükleme
router.post('/upload-image', protect, upload.single('image'), businessController.uploadBusinessImage);

module.exports = router;
