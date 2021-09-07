const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminController = {
  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        attributes: ['id', 'name'],
        include: [Category]
      })
      return res.json({ restaurants })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = adminController