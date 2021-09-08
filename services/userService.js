const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const bcrypt = require('bcryptjs')

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
}

module.exports = userService