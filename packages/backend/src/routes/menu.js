const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const MenuItem = require('../models/MenuItem');
const Rating = require('../models/Rating');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { protect, isBusiness } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
// Statik dosya sunumu artık index.js'de yapılıyor

// Tüm menü öğelerini getir (businessName ile filtrelenebilir)
router.get('/', async (req, res) => {
  try {
    const { businessName } = req.query;
    let where = {};
    if (businessName) {
      where.businessName = { [Op.iLike]: businessName };
    }
    
    // Tüm menü öğelerini getir
    const menuItems = await MenuItem.findAll({ where });
    
    // Tüm menü öğeleri için ortalama puanları al
    const ratingAverages = await Rating.findAll({
      attributes: [
        'menuItemId',
        [sequelize.fn('AVG', sequelize.col('foodRating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'ratingCount']
      ],
      group: ['menuItemId']
    });
    
    // Get comment counts for all menu items
    const commentCounts = await Rating.findAll({
      attributes: [
        'menuItemId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'commentCount']
      ],
      where: {
        comment: {
          [Op.not]: null,
          [Op.ne]: ''
        }
      },
      group: ['menuItemId']
    });
    
    // Her menuItemId için puanların bir haritasını oluştur
    const ratingsMap = {};
    ratingAverages.forEach(rating => {
      ratingsMap[rating.menuItemId] = {
        averageRating: parseFloat(rating.dataValues.averageRating).toFixed(1),
        ratingCount: parseInt(rating.dataValues.ratingCount)
      };
    });
    
    // Create a map of comment counts by menuItemId
    const commentsMap = {};
    commentCounts.forEach(count => {
      commentsMap[count.menuItemId] = parseInt(count.dataValues.commentCount);
    });
    
    // Puanları menü öğelerine ekle
    const menuItemsWithRatings = menuItems.map(item => {
      const itemData = item.toJSON();
      const ratingData = ratingsMap[item.id] || { averageRating: 0, ratingCount: 0 };
      return {
        ...itemData,
        averageRating: parseFloat(ratingData.averageRating),
        ratingCount: ratingData.ratingCount,
        commentCount: commentsMap[item.id] || 0
      };
    });
    
    res.json(menuItemsWithRatings);
  } catch (error) {
    console.error('Puanlarla birlikte menü öğeleri alınırken hata:', error);
    res.status(500).json({ message: error.message });
  }
});

// Yeni menü öğesi ekle
router.post('/', protect, isBusiness, upload.single('image'), async (req, res) => {
  try {
    const { productName, price, category, explanation } = req.body;
    const businessName = req.user.name;
    
    if (!businessName || !productName || !price || !category) {
      return res.status(400).json({ message: 'Eksik veya hatalı alanlar var.' });
    }
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.filename;
      console.log('New menu item with image:', req.file.filename);
    }
    
    const menuItem = await MenuItem.create({
      businessName,
      productName,
      price: parseFloat(price),
      category,
      explanation: explanation || '',
      imageUrl
    });
    
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Menü öğesi eklenirken hata:', error);
    res.status(400).json({ message: error.message || 'Bir hata oluştu' });
  }
});

// Menü öğesi güncelle
router.put('/:id', protect, isBusiness, upload.single('image'), async (req, res) => {
  try {
    const { productName, price, category, explanation } = req.body;
    const menuItem = await MenuItem.findByPk(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menü öğesi bulunamadı.' });
    }
    
    // Eğer yeni resim yüklendiyse, eski resmi sil
    if (req.file) {
      if (menuItem.imageUrl) {
        try {
          const oldImagePath = path.join(__dirname, '../../uploads', menuItem.imageUrl);
          console.log('Updating image, old image path:', oldImagePath);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Old image deleted successfully');
          } else {
            console.log('Old image file not found, skipping deletion');
          }
        } catch (error) {
          console.error('Error deleting old image:', error.message);
          // Hata olsa bile işleme devam et
        }
      }
      menuItem.imageUrl = req.file.filename;
      console.log('New image filename:', req.file.filename);
    }
    
    // Diğer alanları güncelle
    menuItem.productName = productName || menuItem.productName;
    menuItem.price = price ? parseFloat(price) : menuItem.price;
    menuItem.category = category || menuItem.category;
    menuItem.explanation = explanation || menuItem.explanation;
    
    await menuItem.save();
    res.json(menuItem);
  } catch (error) {
    console.error('Menü öğesi güncellenirken hata:', error);
    res.status(400).json({ message: error.message || 'Bir hata oluştu' });
  }
});

// İşletmenin kendi menüsünü getir
router.get('/business', protect, isBusiness, async (req, res) => {
  try {
    const businessName = req.user.name;
    const menuItems = await MenuItem.findAll({ where: { businessName } });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Menü öğesi sil
router.delete('/:id', protect, isBusiness, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menü öğesi bulunamadı.' });
    }
    
    // Önce Orders tablosundaki ilişkileri kontrol et
    const sequelize = MenuItem.sequelize;
    const [orderResults] = await sequelize.query(
      `SELECT COUNT(*) as orderCount FROM "Orders" WHERE "productId" = :menuItemId`,
      { replacements: { menuItemId: req.params.id } }
    );
    
    if (orderResults[0].ordercount > 0) {
      return res.status(400).json({ 
        message: 'Bu menü öğesi siparişlerde kullanıldığı için silinemez. Önce ilgili siparişleri silin veya güncelleyin.' 
      });
    }
    
    // Resmi sil
    if (menuItem.imageUrl) {
      try {
        const imagePath = path.join(__dirname, '../../uploads', menuItem.imageUrl);
        console.log('Deleting image at:', imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Image deleted successfully');
        } else {
          console.log('Image file not found, skipping deletion');
        }
      } catch (error) {
        console.error('Error deleting image:', error.message);
        // Hata olsa bile işleme devam et
      }
    }
    
    await menuItem.destroy();
    res.json({ message: 'Menü öğesi silindi.' });
  } catch (error) {
    console.error('Menü öğesi silinirken hata:', error);
    res.status(500).json({ message: error.message || 'Bir hata oluştu' });
  }
});

module.exports = router;