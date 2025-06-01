const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Favorite = require('../models/Favorite');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Sales trends - günlük/haftalık/aylık satış verileri
router.get('/sales-trends', protect, async (req, res) => {
  try {
    const { timeRange = 'daily' } = req.query;
    const businessId = req.user.id;
    
    let dateFilter = {};
    const now = new Date();
    
    if (timeRange === 'daily') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { createdAt: { [Op.gte]: thirtyDaysAgo } };
    } else if (timeRange === 'weekly') {
      const twelveWeeksAgo = new Date(now);
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
      dateFilter = { createdAt: { [Op.gte]: twelveWeeksAgo } };
    } else if (timeRange === 'monthly') {
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      dateFilter = { createdAt: { [Op.gte]: twelveMonthsAgo } };
    }

    // Tüm tamamlanmış siparişleri çek
    const orders = await Order.findAll({
      where: {
        businessId,
        isCompleted: true,
        ...dateFilter
      },
      include: [{
        model: MenuItem,
        as: 'menuItem',
        attributes: ['price']
      }],
      raw: true
    });

    // Gruplama için JS ile işleyelim
    const groupMap = {};
    orders.forEach(order => {
      let dateKey;
      if (timeRange === 'daily') {
        dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
      } else if (timeRange === 'weekly') {
        const d = new Date(order.createdAt);
        const week = Math.ceil((((d - new Date(d.getFullYear(),0,1)) / 86400000) + new Date(d.getFullYear(),0,1).getDay()+1)/7);
        dateKey = `${d.getFullYear()}-W${week}`;
      } else if (timeRange === 'monthly') {
        const d = new Date(order.createdAt);
        dateKey = `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}`;
      }
      if (!groupMap[dateKey]) groupMap[dateKey] = { orders: 0, revenue: 0 };
      groupMap[dateKey].orders += 1;
      groupMap[dateKey].revenue += (parseFloat(order['menuItem.price']) || 0) * order.quantity;
    });

    // Sonuçları sırala
    const formattedData = Object.entries(groupMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, val]) => ({
        date,
        orders: val.orders,
        revenue: val.revenue,
        sales: val.revenue
      }));

    res.json(formattedData);
  } catch (error) {
    console.error('Sales trends error:', error);
    res.status(500).json({ error: 'Satış verileri alınırken hata oluştu' });
  }
});

// En çok satılan ürünler
router.get('/top-products', protect, async (req, res) => {
  try {
    const businessId = req.user.id;

    // Tüm tamamlanmış siparişleri çek
    const orders = await Order.findAll({
      where: {
        businessId,
        isCompleted: true
      },
      include: [{
        model: MenuItem,
        as: 'menuItem',
        attributes: ['productName', 'category', 'price']
      }]
    });

    // Ürün bazında grupla
    const productMap = {};
    orders.forEach(order => {
      const pid = order.productId;
      if (!productMap[pid]) {
        productMap[pid] = {
          id: pid,
          name: order.menuItem?.productName || '',
          category: order.menuItem?.category || '',
          sales: 0,
          revenue: 0
        };
      }
      productMap[pid].sales += order.quantity;
      productMap[pid].revenue += (parseFloat(order.menuItem?.price) || 0) * order.quantity;
    });

    // En çok satan ilk 10 ürünü sırala
    const formattedProducts = Object.values(productMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    res.json(formattedProducts);
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ error: 'En çok satılan ürünler alınırken hata oluştu' });
  }
});

// Favorites Analysis (Şirkete ait ürünlerin favori sayısı)
router.get('/favorites-analysis', protect, async (req, res) => {
  try {
    const businessId = req.user.id;

    // Şirkete ait tüm menu item'ları bul
    const businessMenuItems = await MenuItem.findAll({
      where: { businessName: req.user.name },
      attributes: ['id', 'productName']
    });

    const menuItemIds = businessMenuItems.map(item => item.id);

    if (menuItemIds.length === 0) {
      return res.json([]);
    }

    // Her bir menuItem için kaç kez favorilendiğini bul
    const favorites = await Favorite.findAll({
      where: { menuItemId: menuItemIds },
      attributes: ['menuItemId']
    });

    // Favori sayısını grupla
    const favCountMap = {};
    favorites.forEach(fav => {
      favCountMap[fav.menuItemId] = (favCountMap[fav.menuItemId] || 0) + 1;
    });

    // Toplam favori sayısı (sıfırsa 1 yap, yüzde hesaplaması için)
    const totalFavorites = Object.values(favCountMap).reduce((a, b) => a + b, 0) || 1;

    // Sonuçları hazırla
    const result = businessMenuItems.map(item => ({
      name: item.productName,
      favorites: favCountMap[item.id] || 0,
      percentage: Math.round(((favCountMap[item.id] || 0) / totalFavorites) * 100)
    }));

    res.json(result);
  } catch (error) {
    console.error('Favorites analysis error:', error);
    res.status(500).json({ error: 'Favori analizi alınırken hata oluştu' });
  }
});

// Toplam Sipariş, Toplam Gelir, Ortalama Sipariş Tutarı
router.get('/stats', protect, async (req, res) => {
  try {
    const businessId = req.user.id;

    // Tüm tamamlanmış siparişleri çek
    const orders = await Order.findAll({
      where: {
        businessId,
        isCompleted: true
      },
      include: [{
        model: MenuItem,
        as: 'menuItem',
        attributes: ['price']
      }]
    });

    // Toplam sipariş ve toplam gelir hesapla
    let totalOrders = 0;
    let totalRevenue = 0;

    orders.forEach(order => {
      const price = parseFloat(order.menuItem?.price) || 0;
      totalOrders += 1;
      totalRevenue += price * order.quantity;
    });

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalOrders,
      totalSales: totalRevenue,
      averageOrderValue
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınırken hata oluştu' });
  }
});

module.exports = router; 