const db = require('../models')
const User = db.User
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
}

module.exports = userService