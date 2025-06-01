const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const MenuItem = require('../models/MenuItem');
const { protect } = require('../middleware/authMiddleware');
const sequelize = require('../config/database');

// Kullanıcının favorilerini getir
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({ where: { userId: req.user.id } });
    const menuItemIds = favorites.map(f => f.menuItemId);
    const menuItems = await MenuItem.findAll({ where: { id: menuItemIds } });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favori ekle
router.post('/', protect, async (req, res) => {
  try {
    const { menuItemId } = req.body;
    if (!menuItemId) return res.status(400).json({ message: 'menuItemId gerekli' });
    const [favorite, created] = await Favorite.findOrCreate({ where: { userId: req.user.id, menuItemId } });
    res.status(created ? 201 : 200).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favori sil
router.delete('/:menuItemId', protect, async (req, res) => {
  try {
    const { menuItemId } = req.params;
    await Favorite.destroy({ where: { userId: req.user.id, menuItemId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Menü itemlarının favori sayılarını getir
router.get('/counts', async (req, res) => {
  try {
    const { menuItemIds } = req.query;
    if (!menuItemIds) {
      return res.status(400).json({ message: 'menuItemIds gerekli' });
    }

    const ids = menuItemIds.split(',').map(id => parseInt(id));
    const favorites = await Favorite.findAll({
      where: { menuItemId: ids },
      attributes: ['menuItemId', [sequelize.fn('COUNT', sequelize.col('menuItemId')), 'count']],
      group: ['menuItemId']
    });

    const counts = {};
    favorites.forEach(fav => {
      counts[fav.get('menuItemId')] = parseInt(fav.get('count'));
    });

    // Hiç favorisi olmayanlar için de 0 dön
    ids.forEach(id => {
      if (typeof counts[id] === 'undefined') counts[id] = 0;
    });

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 