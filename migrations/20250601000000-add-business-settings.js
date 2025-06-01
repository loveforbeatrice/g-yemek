const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'openingTime', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '09:00',
    });
    
    await queryInterface.addColumn('users', 'closingTime', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '22:00',
    });
    
    await queryInterface.addColumn('users', 'imageUrl', {
      type: DataTypes.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('users', 'isOpen', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'openingTime');
    await queryInterface.removeColumn('users', 'closingTime');
    await queryInterface.removeColumn('users', 'imageUrl');
    await queryInterface.removeColumn('users', 'isOpen');
  }
};
