const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead 
} = require('../controllers/notificationController');

// Get all notifications for authenticated user
router.get('/', protect, getUserNotifications);

// Mark a notification as read
router.patch('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.patch('/read-all', protect, markAllAsRead);

module.exports = router;
