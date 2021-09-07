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
      cb({ restaurants }) //完成處理後呼叫cb,傳入data
    } catch (err) {
      cb({ status: 'error', message: `${err}` })
    }
  },

  getRestaurant: async (req, res, cb) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id,
        {
          attributes: ['id', 'name', 'tel', 'address', 'opening_hours', 'description', 'image'],
          include: [Category]
        })
      cb({ restaurant: restaurant.toJSON() })
    } catch (err) {
      cb({ status: 'error', message: `${err}` })
    }
  },

  deleteRestaurant: async (req, res, cb) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      await restaurant.destroy()
      cb({ status: 'success', message: '' })
    } catch (err) {
      cb({ status: 'error', message: `${err}` })
    }
  },
}

module.exports = adminService