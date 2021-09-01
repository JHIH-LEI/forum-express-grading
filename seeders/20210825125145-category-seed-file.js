'use strict';
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Categories',
      ['中式料理', '日本料理', '義大利料理', '墨西哥料理', '素食料理', '美式料理', '複合式料理'].map((item, index) =>
      ({
        id: index * 10 + 1,
        name: item,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      ), {})

    await queryInterface.bulkInsert('Restaurants',
      Array.from({ length: 50 }).map((d, i) =>
      ({
        name: faker.name.findName(),
        tel: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        opening_hours: '8:00',
        image: `https://loremflickr.com/320/240/restaurant,food/?lock=${Math.random() * 100}`,
        description: faker.lorem.text(),
        createdAt: new Date(),
        updatedAt: new Date(),
        CategoryId: Math.floor(Math.random() * 6) * 10 + 1
      }), {})
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Categories', null, {})
    await queryInterface.bulkDelete('Restaurants', null, {})
  }
};
