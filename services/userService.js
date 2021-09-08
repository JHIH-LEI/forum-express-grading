const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const bcrypt = require('bcryptjs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const perPageUser = 2
const perPageComments = 5
const perPageFavoritedRest = 5

const userService = {
  signUp: async (req, res, cb) => {
    try {
      const { name, email, password, passwordCheck } = req.body
      if (password !== passwordCheck) {
        return cb({ status: 'error', message: '兩次密碼輸入不同！', user: { name, email, password, passwordCheck } })
      }

      const user = await User.findOne({ where: { email } })

      if (user) {
        return cb({ status: 'error', message: 'Email已被註冊', user: { name, email, password, passwordCheck } })
      }
      await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
      })
      return cb({ status: 'success', message: '' })
    } catch (err) {
      console.warn(err)
      return cb({ status: 'error', message: `${err}` })
    }
  },

  getTopUser: async (req, res, cb) => {
    try {
      // 找出所有使用者，及每一個使用者的追蹤者，會回傳每個user資料及對應的followers
      let users = await User.findAll({
        attributes: ['id', 'name', 'avatar'],
        include: [{ model: User, as: 'Followers', attributes: ['id'], through: { attributes: [] } }]
      })
      // 整理users資料
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        // 判斷目前登陸的使用者是否已經追蹤他
        isFollowed: req.user.Followings.map(following => following.id).includes(user.id)
      }))
      // 依照追蹤人數排序名單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return cb({ users, topUser: 'topUserPage' }) // 以後可以改為currentPage，方便前端共用元件做邏輯判斷
    } catch (err) {
      console.warn(err)
      return cb({ status: 'server error', message: `${err}` })
    }
  },

  getUser: async (req, res, cb) => {
    try {
      const { id } = req.params
      // 計算評論頁數相關邏輯
      const page = Number(req.query.page) || 1
      const totalComments = await Comment.count({ where: { UserId: id } })
      const pages = Math.ceil(totalComments / perPageComments)
      const next = page + 1 > pages ? page : page + 1
      const prev = page - 1 < 1 ? page : page - 1
      const totalPage = Array.from({ length: pages }).map((item, idex) => (idex + 1))
      let offset = 0
      if (req.query.page) offset = (page - 1) * perPageComments
      // 取得使用者資料及其評論過的餐廳、追蹤的人、粉絲
      const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'avatar', 'banner'],
        include: [
          {
            model: Comment,
            attributes: ['RestaurantId'],
            offset, limit: perPageComments,
            include: { model: Restaurant, attributes: ['id', 'name', 'image'] }
          },
          {
            model: Restaurant,
            as: 'FavoritedRestaurants',
            attributes: ['id', 'image', 'name'],
            through: { attributes: [] } //join table資料不需要
          },
          {
            model: User,
            as: 'Followings',
            attributes: ['id', 'name', 'avatar'],
            through: { attributes: [] } //join table資料不需要
          },
          {
            model: User,
            as: 'Followers',
            attributes: ['id', 'name', 'avatar'],
            through: { attributes: [] } //join table資料不需要
          }
        ],
      })

      if (!user) {
        return cb({ status: 'error', message: '找不到使用者,已返回至您的個人檔案！' })
      }

      const totalFollowings = user.Followings.length
      const totalFollowers = user.Followers.length
      const totalFavoritedRestaurants = user.FavoritedRestaurants.length

      // 修改收藏餐廳、追蹤者/粉絲清單的長度
      user.Followings = totalFollowings > perPageUser ? user.Followings.slice(0, perPageUser) : user.Followings//只回傳兩個正在追隨的人
      user.Followers = totalFollowers > perPageUser ? user.Followers.slice(0, perPageUser) : user.Followers //只回傳兩個粉絲
      user.FavoritedRestaurants = totalFavoritedRestaurants > perPageFavoritedRest ? user.FavoritedRestaurants.slice(0, perPageFavoritedRest) : user.FavoritedRestaurants

      // 判斷這個使用者是否有被登陸使用者追蹤
      const isFollowed = user.Followers.map(user => user.id).includes(req.user.id)
      return cb({
        status: 'success', user: user.toJSON(),
        totalComments, totalFavoritedRestaurants, totalFollowers, totalFollowings,
        totalPage, next, prev,
        isFollowed,
      })
    } catch (err) {
      console.warn(err)
      return cb({ status: 'server error', message: `${err}` })
    }
  },

  putUser: async (req, res, cb) => {
    try {
      const { name } = req.body
      const { files } = req

      if (!name.trim()) {
        return cb({ status: 'error', message: '姓名不可為空' })
      }
      const user = await User.findByPk(req.params.id)
      await user.update({ name })
      imgur.setClientID(IMGUR_CLIENT_ID)
      // 如果有檔案
      if (files) {
        // 如果檔案有大頭貼
        if (files.avatar) {
          await imgur.upload(files.avatar[0].path, async (err, img) => {
            try {
              await user.update({ avatar: img.data.link || user.avatar })
            } catch (err) {
              console.warn(err)
              return cb({ status: 'server error', message: `上傳頭貼失敗，錯誤：${err}` })
            }
          })
        }
        // 如果檔案有封面照
        if (files.banner) {
          await imgur.upload(files.banner[0].path, async (err, img) => {
            try {
              await user.update({ banner: img.data.link || user.banner })
            } catch (err) {
              console.warn(err)
              return cb({ status: 'server error', message: `上傳封面失敗，錯誤：${err}` })
            }
          })
        }
      }
      return cb({ status: 'success', message: '資料更新成功' })
    } catch (err) {
      console.warn(err)
      return cb({ status: 'server error', message: `${err}` })
    }
  },

  getFavoritedRestaurants: async (req, res, cb) => {
    try {
      let user = await User.findOne({
        where: { id: req.params.userId },
        attributes: ['id', 'name'],
        include: [{
          model: Restaurant, as: 'FavoritedRestaurants', attributes: ['id', 'name', 'image', 'description'],
          through: { attributes: [] }
        }]
      })

      user.FavoritedRestaurants = user.FavoritedRestaurants.map(rest => ({
        ...rest.dataValues,
        description: rest.description.length > 50 ? rest.description.substring(0, 50) + '...' : rest.description
      }))
      return cb({ user: user.toJSON() })
    } catch (err) {
      console.warn(err)
      return cb({ status: 'server error', message: `${err}` })
    }
  }
}

module.exports = userService