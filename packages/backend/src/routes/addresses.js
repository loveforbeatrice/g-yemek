const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// GET - Tüm adresleri getir
router.get('/', addressController.getAllAddresses);

// POST - Yeni adres ekle
router.post('/', addressController.createAddress);

// PUT - Adres güncelle
router.put('/:id', addressController.updateAddress);

// DELETE - Adres sil
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
