const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add averageRating column
    await queryInterface.addColumn('users', 'averageRating', {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    });
    
    // Add totalRatings column
    await queryInterface.addColumn('users', 'totalRatings', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'averageRating');
    await queryInterface.removeColumn('users', 'totalRatings');
  }
};
