const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Order = require('./Order');
const MenuItem = require('./MenuItem');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'id'
    }
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: MenuItem,
      key: 'id'
    }
  },
  restaurantRating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  foodRating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: true,
  updatedAt: false
});

// Define relationships
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Rating.belongsTo(User, { foreignKey: 'businessId', as: 'business' });
Rating.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Rating.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

module.exports = Rating;
