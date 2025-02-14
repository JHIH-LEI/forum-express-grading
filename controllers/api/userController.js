const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const userService = require('../../services/userService')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signIn: async (req, res) => {
    try {
      // 檢查必要資料
      if (!req.body.email || !req.body.password) {
        return res.json({ status: 'error', message: '所有欄位都是必填項！' })
      }
      // 檢查user是否存在與密碼是否正確
      let username = req.body.email
      let password = req.body.password

      const user = await User.findOne({ where: { email: username } })
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'no such user found' })
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ status: 'error', message: '帳號or密碼錯誤' })
      }
      // 簽發token
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: 'ok',
        token,
        user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
      })
    } catch (err) {
      console.warn(err)
    }
  },

  signUp: (req, res) => {
    userService.signUp(req, res, (data) => res.json(data))
  },

  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => res.json(data))
  },

  getUser: (req, res) => {
    userService.getUser(req, res, (data) => res.json(data))
  },

  putUser: (req, res) => {
    userService.putUser(req, res, (data) => res.json(data))
  },

  getFavoritedRestaurants: (req, res) => {
    userService.getFavoritedRestaurants(req, res, (data) => res.json(data))
  },

  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => res.json(data))
  },

  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => res.json(data))
  },

  addLike: (req, res) => {
    userService.addLike(req, res, (data) => res.json(data))
  },

  removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => res.json(data))
  },

  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => res.json(data))
  },

  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => res.json(data))
  },

  getFollowings: (req, res) => {
    userService.getFollowings(req, res, (data) => res.json(data))
  },

  getFollowers: (req, res) => {
    userService.getFollowers(req, res, (data) => res.json(data))
  }
}

module.exports = userController