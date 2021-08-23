const bcrypt = require('bcrypt')
const db = require('../models')
const User = db.User

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.render('signup')
    }
    User.findOne({ where: { email } })
      .then(user => {
        if (user) {
          req.flash('error_messages', 'Email已被註冊！')
          return res.render('signup')
        }
        return User.create({
          name,
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        })
          .then(user => {
            req.flash('success_messages', '註冊成功')
            res.redirect('/signin')
          })
      })
  }
}

module.exports = userController