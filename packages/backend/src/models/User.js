const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isBusiness: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  openingTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '09:00',
  },
  closingTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '22:00',
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  allowPushNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  allowPullNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  allowPromotionNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },  min_basket_total: {
    type: DataTypes.NUMERIC(10,2),
    defaultValue: 0,
    allowNull: false,
  },
  averageRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: false,
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Şifre karşılaştırma metodu
User.prototype.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Şifre sıfırlama token'ı oluşturma metodu
User.prototype.getResetPasswordToken = function() {
  // Rastgele token oluştur
  const resetToken = require('crypto').randomBytes(20).toString('hex');
  
  // Token'ı hash'le ve kullanıcıya kaydet
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Token'ın geçerlilik süresini 10 dakika olarak ayarla
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

module.exports = User;
