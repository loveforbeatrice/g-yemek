const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Otp = sequelize.define('Otp', {
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Otp;
