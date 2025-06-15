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

    await queryInterface.addColumn('users', 'min_basket_total', {
      type: Sequelize.NUMERIC(10,2),
      defaultValue: 0,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'openingTime');
    await queryInterface.removeColumn('users', 'closingTime');
    await queryInterface.removeColumn('users', 'imageUrl');
    await queryInterface.removeColumn('users', 'isOpen');
    await queryInterface.removeColumn('users', 'min_basket_total');
  }
};
