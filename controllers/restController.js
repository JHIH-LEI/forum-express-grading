const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const pageLimit = 10
const commentLimit = 3

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
      console.warn(err)
    }
  },
  getRestaurant: async (req, res) => {
    try {
      const { commentId, id } = req.params
      // 跟頁數有關的變數
      const page = Number(req.query.page) || 1
      const totalComments = await Comment.count({ where: { RestaurantId: id } })
      const pages = Math.ceil(totalComments / commentLimit)
      const totalPage = Array.from({ length: pages }).map((d, i) => i + 1)
      let offset = 0
      // 如果有選頁數要計算偏移量
      if (req.query.page) {
        offset = (page - 1) * commentLimit
      }
      // 計算上一頁
      const prev = page - 1 || 1
      // 計算下一頁
      const next = (page + 1) > pages ? page : page + 1

      // 抓餐廳資料
      const restaurant = await Restaurant.findByPk(id, {
        include: [
          { model: Category, attributes: ['name'] }, //取得餐廳類別名稱
          {
            model: Comment, //取得該餐廳的留言
            separate: true, //如果不加這個，limit跟offset會失效，只能加到Many那
            limit: commentLimit,
            offset,
            order: [
              ['updatedAt', 'DESC'] //最新的留言在最上面
            ],
            include: { model: User, attributes: ['id', 'name', 'updatedAt'] },
          }
        ]
      })

      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        commentId, //代表想要修改的評論
        totalPage, //評論總頁數
        prev, next
      })
    } catch (err) {
      console.warn(err)
    }
  }
}
module.exports = restController