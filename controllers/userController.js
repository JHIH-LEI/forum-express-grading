const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
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
  }
}

module.exports = userController