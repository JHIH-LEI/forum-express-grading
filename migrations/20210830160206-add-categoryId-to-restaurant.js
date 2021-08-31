'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'CategoryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
    // 維護舊資料
    await queryInterface.bulkUpdate('Restaurants', {
      CategoryId: 1,
    })

    await queryInterface.addConstraint('Restaurants', {
      fields: ['CategoryId'],
      type: 'foreign key',
      references: { //Required field
        table: 'Categories',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'CategoryId')
  }
}