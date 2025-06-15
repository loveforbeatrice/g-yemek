const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Çalışma saatleri kontrolü için yardımcı fonksiyon
const isWithinBusinessHours = (openingTime, closingTime) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  // Eğer kapanış saati açılış saatinden küçükse (gece geçiyor)
  // Örnek: 15:00 açılış, 04:00 kapanış
  if (closeTime < openTime) {
    // Şu anki saat açılış saatinden sonra VEYA kapanış saatinden önce
    return currentTime >= openTime || currentTime < closeTime;
  } else {
    // Normal durum: açılış ve kapanış aynı gün içinde
    return currentTime >= openTime && currentTime < closeTime;
  }
};

exports.getBusinessSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Getting business settings for user ID: ${userId}`);

    const user = await User.findByPk(userId);

    if (!user) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (!user.isBusiness) {
      console.log(`User ${userId} is not a business account`);
      return res.status(403).json({ message: 'Bu işlem için işletme hesabı gereklidir' });
    }

    console.log(`Business data for user ${user.name} (ID: ${userId}):`, {
      isOpen: user.isOpen,
      openingTime: user.openingTime,
      closingTime: user.closingTime,
      min_basket_total: user.min_basket_total
    });    // Check business hours but don't auto-update
    // This was causing the manual isOpen toggle to be overwritten
    if (user.openingTime && user.closingTime) {
      const shouldBeOpen = isWithinBusinessHours(user.openingTime, user.closingTime);
      console.log(`Business hours check: According to hours, restaurant should be ${shouldBeOpen ? 'open' : 'closed'}`);
      console.log(`Current status is ${user.isOpen ? 'open' : 'closed'} (Manual setting takes precedence)`);
      
      // We are no longer auto-updating to preserve the manual toggle
      // Instead, we just log the information for debugging purposes
    }

    // Hassas bilgileri çıkar
    const { password, resetPasswordToken, resetPasswordExpire, ...businessData } = user.toJSON();
    console.log(`Returning business settings for ${user.name} (isOpen: ${businessData.isOpen})`);

    return res.status(200).json({
      business: businessData
    });
  } catch (error) {
    console.error('İşletme ayarları alınamadı:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateBusinessSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, openingTime, closingTime, isOpen, min_basket_total } = req.body;

    console.log(`Update business settings request for user ID ${userId}:`, req.body);

    const user = await User.findByPk(userId);

    if (!user) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (!user.isBusiness) {
      console.log(`User ${userId} is not a business account`);
      return res.status(403).json({ message: 'Bu işlem için işletme hesabı gereklidir' });
    }

    console.log(`Before update - Current business settings for ${user.name} (ID: ${userId}):`, {
      name: user.name,
      isOpen: user.isOpen,
      openingTime: user.openingTime, 
      closingTime: user.closingTime,
      min_basket_total: user.min_basket_total
    });

    // Sadece gönderilen alanları güncelle
    const updateData = {};
    if (name) updateData.name = name;
    if (openingTime) updateData.openingTime = openingTime;
    if (closingTime) updateData.closingTime = closingTime;
    if (isOpen !== undefined) {
      console.log(`Updating isOpen status from ${user.isOpen} to ${isOpen}`);
      updateData.isOpen = isOpen;
    }
    if (min_basket_total !== undefined) updateData.min_basket_total = min_basket_total;

    console.log(`Updating business settings for user ${user.name} (ID: ${userId})`, updateData);

    await user.update(updateData);

    // Log the update success
    console.log(`Business settings updated successfully for user ${user.name} (ID: ${userId}). isOpen now: ${user.isOpen}`);

    // Güncellenmiş kullanıcı bilgilerini geri döndür
    const { password, resetPasswordToken, resetPasswordExpire, ...updatedUserData } = user.toJSON();

    return res.status(200).json({
      message: 'İşletme ayarları başarıyla güncellendi',
      business: updatedUserData
    });
  } catch (error) {
    console.error('İşletme ayarları güncellenirken hata oluştu:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.uploadBusinessImage = async (req, res) => {
  try {
    const userId = req.user.id;

    // req.file upload middleware'i tarafından eklenir
    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir resim yükleyin' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (!user.isBusiness) {
      return res.status(403).json({ message: 'Bu işlem için işletme hesabı gereklidir' });
    }

    // Eski resmi sil
    if (user.imageUrl) {
      try {
        const oldImagePath = path.join(__dirname, '../../uploads', user.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.error('Eski resim silinirken hata oluştu:', err);
      }
    }

    // Yeni resim adını kaydet
    await user.update({ imageUrl: req.file.filename });

    return res.status(200).json({
      message: 'İşletme resmi başarıyla güncellendi',
      imageUrl: req.file.filename
    });
  } catch (error) {
    console.error('İşletme resmi yüklenirken hata oluştu:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};
