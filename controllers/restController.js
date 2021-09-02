const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: async (req, res) => {
    try {
      // 如果queryString有類別，就要依據類別做篩選
      const whereQuery = {}
      let categoryId = ''
      if (req.query.categoryId) {
        // 獲取篩選條件
        categoryId = Number(req.query.categoryId)
        whereQuery.CategoryId = categoryId // {CategoryId: 41}
      }
      let restaurants = await Restaurant.findAll({ raw: true, nest: true, include: { model: Category, attributes: ['name'] }, where: whereQuery })
      // 把要傳到前端的資料其餐廳描述做修改
      restaurants = restaurants.map(rest => ({
        ...rest, //其他資料不變
        description: rest.description.substring(0, 50) //描述只要50字
      }))
      const categories = await Category.findAll({ raw: true, attributes: ['id', 'name'] })
      return res.render('restaurants', { restaurants, categories, categoryId })
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