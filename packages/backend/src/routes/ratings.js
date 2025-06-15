const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const ratingController = require('../controllers/ratingController');

const router = express.Router();

// Create a new rating
router.post('/', protect, ratingController.createRating);

// Get ratings for a business
router.get('/business/:businessId', ratingController.getBusinessRatings);

// Get ratings for a specific menu item
router.get('/menuItem/:menuItemId', ratingController.getMenuItemRatings);

// Get ratings created by authenticated user
router.get('/user', protect, ratingController.getUserRatings);

// Check if an order has been rated
router.get('/check/:orderId', protect, ratingController.checkOrderRated);

module.exports = router;
