const bcrypt = require('bcryptjs')
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
            // 直接幫他登陸
            res.redirect(307, '/signin')
          })
      })
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
  }
}

module.exports = userController