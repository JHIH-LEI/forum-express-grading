const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: async (req, res, cb) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        attributes: ['id', 'name'],
        include: [Category]
      })
      cb({ restaurants })
    } catch (err) {
      console.warn(err)
    }
  },
}

module.exports = adminService