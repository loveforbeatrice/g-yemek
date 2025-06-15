const Rating = require('../models/Rating');
const User = require('../models/User');
const Order = require('../models/Order');
const sequelize = require('../config/database');

// Create a new rating
exports.createRating = async (req, res) => {
  try {
    const { orderId, menuItemId, restaurantRating, foodRating, comment } = req.body;
    
    // Find the order to verify it belongs to the user and get businessId
    const order = await Order.findOne({
      where: { 
        id: orderId, 
        userId: req.user.id,
        isDelivered: true  // Only delivered orders can be rated
      }
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or not eligible for rating' 
      });
    }
    
    // Check if the order has already been rated
    const existingRating = await Rating.findOne({
      where: { orderId }
    });
    
    if (existingRating) {
      return res.status(400).json({ 
        success: false, 
        message: 'This order has already been rated' 
      });
    }
    
    // Start a transaction to ensure data consistency
    const transaction = await sequelize.transaction();
    
    try {
      // Create the rating
      const rating = await Rating.create({
        userId: req.user.id,
        businessId: order.businessId,
        orderId,
        menuItemId: menuItemId || order.productId, // Use provided menuItemId or fall back to order.productId
        restaurantRating,
        foodRating,
        comment
      }, { transaction });
      
      // Update the business average rating
      const business = await User.findByPk(order.businessId, { transaction });
      
      if (business) {
        // Calculate new average: (oldAvg * oldCount + newRating) / (oldCount + 1)
        const newTotalRatings = business.totalRatings + 1;
        const newAverageRating = 
          ((business.averageRating * business.totalRatings) + 
           ((restaurantRating + foodRating) / 2)) / newTotalRatings;
        
        await business.update({
          averageRating: Number(newAverageRating.toFixed(1)),
          totalRatings: newTotalRatings
        }, { transaction });
      }
      
      // Commit the transaction
      await transaction.commit();
      
      res.status(201).json({
        success: true,
        data: rating
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }  } catch (error) {
    console.error('Error creating rating:', error);
    console.error('Request body:', req.body);
    console.error('User ID:', req.user?.id);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      details: {
        requestBody: req.body,
        userId: req.user?.id
      }
    });
  }
};

// Get ratings for a business
exports.getBusinessRatings = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const ratings = await Rating.findAll({
      where: { businessId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Get the business information including rating stats
    const business = await User.findByPk(businessId, {
      attributes: ['id', 'name', 'averageRating', 'totalRatings']
    });
    
    if (!business) {
      return res.status(404).json({ 
        success: false, 
        message: 'Business not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      business,
      ratings
    });
  } catch (error) {
    console.error('Error fetching business ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get ratings created by a user
exports.getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { userId: req.user.id },
      include: [
        { model: User, as: 'business', attributes: ['id', 'name'] },
        { model: Order, as: 'order' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check if an order has been rated
exports.checkOrderRated = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order to verify it belongs to the user
    const order = await Order.findOne({
      where: { 
        id: orderId, 
        userId: req.user.id
      }
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if the order has already been rated
    const existingRating = await Rating.findOne({
      where: { orderId }
    });
    
    res.status(200).json({
      success: true,
      isRated: !!existingRating,
      rating: existingRating
    });
  } catch (error) {
    console.error('Error checking order rating:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get ratings for a menu item
exports.getMenuItemRatings = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    
    const ratings = await Rating.findAll({
      where: { menuItemId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      ratings
    });
  } catch (error) {
    console.error('Error fetching menu item ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
