const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: async (req, res) => {
    try {
      const { name, email, password, passwordCheck } = req.body
      if (password !== passwordCheck) {
        req.flash('error_messages', '兩次密碼輸入不同！')
        return res.render('signup')
      }

      const user = await User.findOne({ where: { email } })

      if (user) {
        req.flash('error_messages', 'Email已被註冊！')
        return res.render('signup')
      }
      await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
      })
      // 直接幫他登陸
      res.redirect(307, '/signin')
    } catch (err) {
      console.warn(err)
    }
  },

  signinPage: (req, res) => {
    return res.render('signin')
  },

  signin: (req, res) => {
    req.flash('success_messages', '登陸成功')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logout()
    res.redirect('/signin')
  },

  getUser: async (req, res) => {
    try {
      const { id } = req.params
      // 計算評論頁數相關邏輯
      const perPageComments = 5
      const page = Number(req.query.page) || 1
      const totalComments = await Comment.count({ where: { UserId: id } })
      const pages = Math.ceil(totalComments / perPageComments)
      const next = page + 1 > pages ? page : page + 1
      const prev = page - 1 < 1 ? page : page - 1
      const totalPage = Array.from({ length: pages }).map((item, idex) => (idex + 1))
      let offset = 0
      if (req.query.page) offset = (page - 1) * perPageComments
      // 取得使用者資料及其評論過的餐廳
      const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'avatar', 'banner'],
        include: [{
          model: Comment,
          attributes: ['RestaurantId'],
          offset, limit: perPageComments,
          include: { model: Restaurant, attributes: ['id', 'name', 'image'] }
        }],
      })

      if (!user) {
        req.flash('error_messages', '找不到使用者,已返回至您的個人檔案！')
        return res.redirect(`/users/${helpers.getUser(req).id}`)
      }

      return res.render('profile', {
        user: user.toJSON(),
        totalComments,
        totalPage, next, prev
      })
    } catch (err) {
      console.warn(err)
    }
  },

  editUser: async (req, res) => {
    try {
      const { id } = req.params
      // 把編輯資料傳到前端
      const user = await User.findByPk(id, { attributes: ['id', 'name'] })
      res.render('editProfile', { user: user.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  },

  putUser: async (req, res) => {
    try {
      const { name } = req.body
      const { files } = req

      if (!name.trim()) {
        req.flash('error_messages', '姓名不可為空')
        return res.redirect('back')
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
            }
          })
        }
      }
      req.flash('success_messages', '資料更新成功')
      return res.redirect(`/users/${req.params.id}`)
    } catch (err) {
      console.warn(err)
    }
  },

  addFavorite: async (req, res) => {
    try {
      await Favorite.create({
        RestaurantId: req.params.restaurantId,
        UserId: req.user.id,
      })
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  removeFavorite: async (req, res) => {
    try {
      const favorite = await Favorite.findOne({
        where: {
          RestaurantId: req.params.restaurantId,
          UserId: req.user.id
        }
      })
      await favorite.destroy()
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  addLike: async (req, res) => {
    try {
      await Like.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      })
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  removeLike: async (req, res) => {
    try {
      const like = await Like.findOne({
        where: {
          RestaurantId: req.params.restaurantId,
          UserId: req.user.id
        }
      })
      await like.destroy()
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  getTopUser: async (req, res) => {
    try {
      // 找出所有使用者，及每一個使用者的追蹤者，會回傳每個user資料及對應的followers
      let users = await User.findAll({
        attributes: ['id', 'name', 'avatar'],
        include: [{ model: User, as: 'Followers', attributes: ['id'] }]
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
      return res.render('topUser', { users, topUser: 'topUserPage' })
    } catch (err) {
      console.warn(err)
    }
  },

  addFollowing: async (req, res) => {
    try {
      await Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId
      })
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  removeFollowing: async (req, res) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })
      await followship.destroy()
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = userController