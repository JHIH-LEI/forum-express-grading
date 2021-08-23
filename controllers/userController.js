const bcrypt = require('bcrypt')
const db = require('../models')
const User = db.User

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    User.create({ name, email, password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null) })
      .then(user => res.redirect('/signin'))
  }
}

module.exports = userController