const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MenuItem = require('./MenuItem');
const User = require('./User');

const Order = sequelize.define('Order', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isAccepted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isDelivered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true,
  createdAt: true,
  updatedAt: false
});

Order.belongsTo(MenuItem, { foreignKey: 'productId', as: 'menuItem' });
Order.belongsTo(User, { foreignKey: 'businessId', as: 'business' });

module.exports = Order; 