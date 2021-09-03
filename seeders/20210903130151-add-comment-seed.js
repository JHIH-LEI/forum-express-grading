'use strict';
const faker = require('faker')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 2 }).map((d, i) =>
      ({
        text: faker.lorem.text(),
        createdAt: new Date(),
        updatedAt: new Date(),
        UserId: 1,
        RestaurantId: i * 10 + 1
      })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
