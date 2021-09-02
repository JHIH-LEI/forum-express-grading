const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: async (req, res) => {
    try {
      let restaurants = await Restaurant.findAll({ raw: true, nest: true, include: { model: Category, attributes: ['name'] } })
      // 把要傳到前端的資料其餐廳描述做修改
      restaurants = restaurants.map(rest => ({
        ...rest, //其他資料不變
        description: rest.description.substring(0, 50) //描述只要50字
      }))
      return res.render('restaurants', { restaurants })
    } catch (err) {
      console.log(err)
    }
  },
  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: { model: Category, attributes: ['name'] } })
      res.render('restaurant', { restaurant: restaurant.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  }
}
module.exports = restController