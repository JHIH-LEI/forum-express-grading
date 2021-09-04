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
      // 找到該使用者按讚的餐廳清單
      const user = await User.findByPk(req.user.id,
        {
          attributes: ['id'],
          include: { model: Restaurant, as: 'LikedRestaurants', attributes: ['id'] }
        })
      // 把要傳到前端的資料其餐廳描述做修改
      const restaurants = result.rows.map(rest => ({
        ...rest, //其他資料不變
        description: rest.description.length > 50 ? rest.description.substring(0, 50) + '...' : rest.description, //描述最多50字
        //將每個餐廳比對使用者收藏的餐廳清單，如果一樣就代表有收藏
        isFavorited: req.user.FavoritedRestaurants.map(rest => rest.id).includes(rest.id),
        // 比對餐廳清單與使用者按讚的餐廳，如果有一樣代表有按讚
        isLiked: user.LikedRestaurants.map(rest => rest.id).includes(rest.id)
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
          },
          // 引入有收藏該餐廳的使用者清單（預設：回傳收藏此餐廳的使用者列表、Favorite） 
          {
            model: User,
            as: 'FavoritedUsers',
            attributes: ['id']
          },
          // 撈出有收藏該餐廳的使用者
          {
            model: User,
            as: 'LikedUsers',
            attributes: ['id']
          }
        ]
      })
      const isFavorited = restaurant.FavoritedUsers.map(user => user.id).includes(req.user.id)
      // 這個餐廳是否有使用者按讚的紀錄
      const isLiked = restaurant.LikedUsers.map(user => user.id).includes(req.user.id)
      await restaurant.increment('viewCounts')
      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        commentId, //代表想要修改的評論
        totalPage, //評論總頁數
        prev, next,
        isFavorited,
        isLiked
      })
    } catch (err) {
      console.warn(err)
    }
  },

  getFeeds: (req, res) => {
    return Promise.all([
      // 撈出10筆餐廳資料
      Restaurant.findAll({
        raw: true, nest: true,
        limit: 10,
        order: [['createdAt', 'DESC']],
        attribute: ['id', 'name', 'description', 'createdAt'],
        include: { model: Category, attributes: ['name'] }
      }),
      // 撈出10筆評論資料
      Comment.findAll({
        raw: true, nest: true,
        limit: 10,
        attribute: ['text', 'updatedAt'],
        order: [['createdAt', 'DESC']],
        include: [
          { model: Restaurant, attributes: ['id', 'name'] },
          { model: User, attributes: ['id', 'name'] }
        ]
      })
    ]).then(([restaurants, comments]) => {
      restaurants = restaurants.map(rest => ({
        ...rest, //其他資料不變
        description: rest.description.length > 50 ? rest.description.substring(0, 50) + '...' : rest.description //描述最多50字
      }))
      return res.render('feeds', { restaurants, comments })
    })
  },
  getDashboard: async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      attributes: ['name', 'id', 'viewCounts'],
      include: [{ model: Category, attributes: ['name'] },
      { model: Comment, attributes: ['id'] }]
    })
    return res.render('dashboard', { restaurant: restaurant.toJSON() })
  }
}
module.exports = restController