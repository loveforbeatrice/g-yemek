const express = require('express');
const {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  getAllBusinesses,
  deleteAccount,
  getNotificationSettings,
  updateNotificationSettings
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const favoritesRouter = require('./favorites');

const router = express.Router();

// Açık rotalar
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Korumalı rotalar
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.delete('/delete', protect, deleteAccount);

// Tüm işletme kullanıcılarını getir
router.get('/businesses', getAllBusinesses);

router.get('/notifications', protect, getNotificationSettings);
router.put('/notifications', protect, updateNotificationSettings);

router.use('/favorites', favoritesRouter);

module.exports = router;
