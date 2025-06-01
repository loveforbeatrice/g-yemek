const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');

// JWT token oluşturma fonksiyonu
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'gizli_anahtar',
    { expiresIn: '30d' }
  );
};

// Kullanıcı kaydı (sign up)
exports.signup = async (req, res) => {
  try {
    console.log('Signup request body:', req.body);
    const { name, phone, email, password, confirmPassword, isBusiness } = req.body;

    // Gerekli alanların kontrolü
    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen tüm zorunlu alanları doldurun (isim, telefon, şifre)'
      });
    }

    // Şifre doğrulama kontrolü
    if (password !== confirmPassword) {
      console.log('Şifreler eşleşmiyor:', { password, confirmPassword });
      return res.status(400).json({
        success: false,
        message: 'Şifreler eşleşmiyor'
      });
    }

    // Telefon numarası kontrolü
    const existingUserByPhone = await User.findOne({ where: { phone } });
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: 'Bu telefon numarası zaten kayıtlı'
      });
    }

    // E-posta kontrolü (eğer varsa)
    if (email) {
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: 'Bu e-posta adresi zaten kayıtlı'
        });
      }
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      phone,
      email,
      password,
      isBusiness: !!isBusiness
    });

    // Token oluştur
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isBusiness: user.isBusiness
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Sequelize validation hatalarını işle
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Kayıt olurken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı girişi (login)
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Telefon numarası ve şifre kontrolü
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen telefon numarası ve şifre girin'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ where: { phone } });

    // Kullanıcı yoksa
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı bilgileri'
      });
    }

    // Şifre kontrolü
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı bilgileri'
      });
    }

    // Token oluştur
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isBusiness: user.isBusiness
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş yaparken bir hata oluştu',
      error: error.message
    });
  }
};

// Mevcut kullanıcı bilgilerini getir
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isBusiness: user.isBusiness
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınırken bir hata oluştu',
      error: error.message
    });
  }
};

// Şifre sıfırlama isteği gönder
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen e-posta adresinizi girin'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu e-posta adresine sahip bir kullanıcı bulunamadı'
      });
    }

    // Şifre sıfırlama token'ı oluştur
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Şifre sıfırlama e-postası gönder
    // NOT: Gerçek uygulamada burada e-posta gönderme işlemi yapılır
    // Şimdilik sadece token'ı dönüyoruz
    
    /* 
    // E-posta gönderme örneği
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    const message = `Şifrenizi sıfırlamak için bu linke tıklayın: ${resetUrl}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Şifre Sıfırlama',
      text: message
    });
    */

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama token\'ı oluşturuldu',
      resetToken // Gerçek uygulamada bu token kullanıcıya gösterilmez
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Hata durumunda token'ı sıfırla
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlama isteği gönderilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Şifre sıfırlama
exports.resetPassword = async (req, res) => {
  try {
    // Token'ı hash'le
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Token'a sahip ve süresi geçmemiş kullanıcıyı bul
    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz token'
      });
    }

    // Yeni şifre kontrolü
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Şifreler eşleşmiyor'
      });
    }

    // Şifreyi güncelle
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Token oluştur
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      message: 'Şifreniz başarıyla sıfırlandı'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlanırken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı bilgilerini güncelle
exports.updateDetails = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updateData = {};

    // Güncellenecek alanları kontrol et
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    // Telefon numarası kontrolü
    if (phone) {
      const existingUserByPhone = await User.findOne({ 
        where: { 
          phone,
          id: { [Op.ne]: req.user.id } // Kendisi hariç
        } 
      });
      
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: 'Bu telefon numarası zaten kayıtlı'
        });
      }
    }

    // E-posta kontrolü
    if (email) {
      const existingUserByEmail = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: req.user.id } // Kendisi hariç
        } 
      });
      
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: 'Bu e-posta adresi zaten kayıtlı'
        });
      }
    }

    // Kullanıcıyı güncelle
    const user = await User.update(updateData, {
      where: { id: req.user.id },
      returning: true
    });

    // Güncel kullanıcı bilgilerini getir
    const updatedUser = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        isBusiness: updatedUser.isBusiness
      }
    });
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Şifre güncelleme
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Şifre kontrolü
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen tüm alanları doldurun'
      });
    }

    // Yeni şifre kontrolü
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Yeni şifreler eşleşmiyor'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findByPk(req.user.id);

    // Mevcut şifre kontrolü
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Mevcut şifre yanlış'
      });
    }

    // Şifreyi güncelle
    user.password = newPassword;
    await user.save();

    // Token oluştur
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Helper function to check if a restaurant should be open based on current time
const isWithinBusinessHours = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) return true; // Default to open if no hours set
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  // If closing time is smaller than opening time (crosses midnight)
  // Example: 22:00 opening, 04:00 closing
  if (closeTime < openTime) {
    // Current time is after opening time OR before closing time
    return currentTime >= openTime || currentTime < closeTime;
  } else {
    // Normal case: opening and closing times on the same day
    return currentTime >= openTime && currentTime < closeTime;
  }
};

// Tüm işletme kullanıcılarını getir
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await User.findAll({ where: { isBusiness: true } });
    
    // Update isOpen status based on business hours for each restaurant
    const updatedBusinesses = businesses.map(business => {
      const businessData = business.toJSON();
      
      // If the business has opening and closing times, check if it should be open
      if (businessData.openingTime && businessData.closingTime) {
        const shouldBeOpen = isWithinBusinessHours(businessData.openingTime, businessData.closingTime);
        
        // If manual override is not set (isOpen is null or undefined), use the calculated value
        if (businessData.isOpen === undefined || businessData.isOpen === null) {
          businessData.isOpen = shouldBeOpen;
        }
        // Otherwise, we keep the manually set value (business.isOpen)
      }
      
      return businessData;
    });
    
    res.status(200).json({ success: true, businesses: updatedBusinesses });
  } catch (error) {
    console.error('Get all businesses error:', error);
    res.status(500).json({ success: false, message: 'İşletmeler alınırken bir hata oluştu', error: error.message });
  }
};
