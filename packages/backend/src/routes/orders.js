const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { protect, isBusiness } = require('../middleware/authMiddleware');
const { createNotification } = require('../controllers/notificationController');
const { Notification } = require('../controllers/notificationController');

// POST /api/orders - Sipariş oluştur (çoklu ürün destekler)
router.post('/', async (req, res) => {
  try {
    const { userId, orders, address } = req.body;
    // orders: [{ businessId, productId, quantity, note }]
    if (!userId || !orders || !Array.isArray(orders) || orders.length === 0 || !address) {
      return res.status(400).json({ message: 'Eksik sipariş verisi' });
    }
    // Sepetteki tüm ürünler aynı işletmeden mı kontrol et
    const businessId = orders[0].businessId;
    const business = await User.findByPk(businessId);
    if (!business || !business.isBusiness) {
      return res.status(400).json({ message: 'Geçersiz işletme.' });
    }
    // Sepet toplamını hesapla
    let total = 0;
    for (const item of orders) {
      const menuItem = await MenuItem.findByPk(item.productId);
      if (!menuItem) return res.status(400).json({ message: 'Ürün bulunamadı.' });
      total += parseFloat(menuItem.price) * item.quantity;
    }
    if (parseFloat(total) < parseFloat(business.min_basket_total)) {
      return res.status(400).json({ message: `Minimum sepet tutarı ${business.min_basket_total} TL olmalıdır.` });
    }
    const createdOrders = await Promise.all(
      orders.map(item =>
        Order.create({
          userId,
          businessId: item.businessId,
          productId: item.productId,
          quantity: item.quantity,
          note: item.note || '',
          address
        })
      )
    );
    // Bildirim sadece bir kez gönderilsin
    await createNotification(
      userId,
      'order_received',
      'Siparişiniz oluşturuldu.',
      {
        businessId: business.id,
        businessName: business.name,
        totalItems: orders.length
      }
    );
    res.status(201).json(createdOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders - Kullanıcının sipariş geçmişini getir
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Siparişleri yıl-ay-gün saat:dakika'ya göre grupla
    const grouped = {};
    orders.forEach(order => {
      const created = order.createdAt;
      const groupKey = created.getFullYear() + '-' + String(created.getMonth()+1).padStart(2, '0') + '-' + String(created.getDate()).padStart(2, '0') + ' ' + String(created.getHours()).padStart(2, '0') + ':' + String(created.getMinutes()).padStart(2, '0');
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push({
        id: order.id,
        quantity: order.quantity,
        note: order.note,
        address: order.address,
        isAccepted: order.isAccepted,
        isCompleted: order.isCompleted,
        isDelivered: order.isDelivered,
        createdAt: order.createdAt,
        menuItem: order.menuItem,
        business: order.business
      });
    });
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/business - İşletmenin onaylanmamış siparişleri
router.get('/business', protect, isBusiness, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { businessId: req.user.id, isAccepted: null },
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/accept - Siparişi onayla
router.patch('/:id/accept', protect, isBusiness, async (req, res) => {
  try {
    // Eğer frontend'den birden fazla sipariş ID'si geliyorsa (grup onayı)
    let orderIds = req.body.orderIds || [req.params.id];
    if (!Array.isArray(orderIds)) orderIds = [orderIds];
    let notified = false;
    let results = [];
    for (const orderId of orderIds) {
      const order = await Order.findByPk(orderId, {
        include: [
          { model: MenuItem, as: 'menuItem' },
          { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
        ]
      });
      if (!order || order.businessId !== req.user.id) continue;
      order.isAccepted = true;
      await order.save();
      // Sadece ilk sipariş için notification gönder
      if (!notified) {
        await createNotification(
          order.userId,
          'order_confirmed',
          `${order.business.name} siparişinizi onayladı.`,
          {
            orderId: order.id,
            businessId: order.businessId,
            businessName: order.business.name,
            menuItemName: order.menuItem.name
          }
        );
        notified = true;
      }
      results.push(order);
    }
    res.json(results.length === 1 ? results[0] : results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/reject - Siparişi reddet
router.patch('/:id/reject', protect, isBusiness, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
      ]
    });
    
    if (!order || order.businessId !== req.user.id) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    order.isAccepted = false;
    await order.save();
    
    // Create notification for the user
    await createNotification(
      order.userId,
      'order_rejected',
      `${order.business.name} siparişinizi reddetti.`,
      {
        orderId: order.id,
        businessId: order.businessId,
        businessName: order.business.name,
        menuItemName: order.menuItem.name
      }
    );
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/business/history - İşletmenin onaylanmış siparişleri
router.get('/business/history', protect, isBusiness, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { businessId: req.user.id, isAccepted: true },
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/business/idle - İşletmenin henüz işlem görmemiş siparişleri
router.get('/business/idle', protect, isBusiness, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        businessId: req.user.id, 
        isAccepted: null,
        isCompleted: false,
        isDelivered: false
      },
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/business/awaiting-delivery - İşletmenin teslim bekleyen siparişleri
router.get('/business/awaiting-delivery', protect, isBusiness, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        businessId: req.user.id, 
        isAccepted: true,
        isCompleted: false,
        isDelivered: false
      },
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/business/counts - İşletmenin sipariş sayılarını getir
router.get('/business/counts', protect, isBusiness, async (req, res) => {
  try {
    // Önce tüm siparişleri al
    const [idleOrders, awaitingDeliveryOrders] = await Promise.all([
      Order.findAll({
        where: { 
          businessId: req.user.id, 
          isAccepted: null,
          isCompleted: false,
          isDelivered: false
        },
        include: [
          { model: MenuItem, as: 'menuItem' },
          { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
        ],
        order: [['createdAt', 'DESC']]
      }),
      Order.findAll({
        where: { 
          businessId: req.user.id, 
          isAccepted: true,
          isCompleted: false,
          isDelivered: false
        },
        include: [
          { model: MenuItem, as: 'menuItem' },
          { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
        ],
        order: [['createdAt', 'DESC']]
      })
    ]);

    // Siparişleri grupla
    const groupOrders = (orders) => {
      const groups = {};
      orders.forEach(order => {
        const userId = order.userId;
        const date = new Date(order.createdAt);
        const minuteKey = `${userId}_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}`;
        if (!groups[minuteKey]) {
          groups[minuteKey] = [];
        }
        groups[minuteKey].push(order);
      });
      return Object.keys(groups).length; // Her grup bir kart/sipariş
    };
    
    res.json({
      idleOrders: groupOrders(idleOrders),
      awaitingDelivery: groupOrders(awaitingDeliveryOrders)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/done - Siparişi teslim edildi olarak işaretle
router.patch('/:id/done', protect, isBusiness, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: User, as: 'business', attributes: ['id', 'name', 'phone'] }
      ]
    });
    
    if (!order || order.businessId !== req.user.id) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    order.isCompleted = true;
    order.isDelivered = true;
    await order.save();
    
    // Create delivery notification with rating request
    await createNotification(
      order.userId,
      'order_delivered',
      `${order.business.name}'dan siparişiniz teslim edildi. (${order.menuItem.productName}) Lütfen deneyiminizi değerlendirin.`,
      {
        orderId: order.id,
        businessId: order.businessId,
        businessName: order.business.name,
        menuItemId: order.productId,
        menuItemName: order.menuItem.productName,
        requiresRating: true,
        isRated: false
      }
    );
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;