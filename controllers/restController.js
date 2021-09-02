const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const pageLimit = 10

const restController = {
  getRestaurants: async (req, res) => {
    try {
      let offset = 0
      const whereQuery = {}
      let categoryId = ''
      // 抓到當前是第幾頁
      let page = Number(req.query.page) || 1
      // 計算偏移量，決定從第幾筆資料開始查找
      if (req.query.page) {
        offset = (page - 1) * pageLimit
      }

      // 如果queryString有類別，就要依據類別做篩選
      if (req.query.categoryId) {
        // 獲取篩選條件
        categoryId = Number(req.query.categoryId)
        whereQuery.CategoryId = categoryId // {CategoryId: 41}
      }

      // 取得餐廳資料及餐廳總數
      const result = await Restaurant.findAndCountAll({
        raw: true,
        nest: true,
        include: { model: Category, attributes: ['name'] },
        where: whereQuery,
        offset,
        limit: pageLimit
      })
      // 把要傳到前端的資料其餐廳描述做修改
      const restaurants = result.rows.map(rest => ({
        ...rest, //其他資料不變
        description: rest.description.substring(0, 50) //描述只要50字
      }))

      // 計算總頁數及前端所需的頁數陣列
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      // 計算上一頁
      let prev = page - 1 || 1
      // 計算下一頁
      let next = page + 1 > pages ? page : page + 1
      // 取得所有類別清單
      const categories = await Category.findAll({ raw: true, attributes: ['id', 'name'] })

      return res.render('restaurants', {
        restaurants,
        categories,
        categoryId,
        page, totalPage, prev, next
      })
    } catch (err) {
      console.log(err)
    }
  },
  getRestaurant: async (req, res) => {
    try {
      const { commentId, id } = req.params
      const restaurant = await Restaurant.findByPk(id, {
        include: [
          { model: Category, attributes: ['name'] },
          { model: Comment, include: { model: User, attributes: ['id', 'name'] } }
        ]
      })
      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        commentId //代表想要修改的評論
      })
    } catch (err) {
      console.warn(err)
    }
  }
}
module.exports = restController