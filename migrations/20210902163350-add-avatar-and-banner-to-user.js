'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'avatar', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('Users', 'banner', {
      type: Sequelize.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'avatar')
    await queryInterface.removeColumn('Users', 'banner')
  }
};
