'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'avatar', {
      type: Sequelize.STRING,
      defaultValue: 'https://image.flaticon.com/icons/png/512/149/149071.png',
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
