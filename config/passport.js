const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},
  (req, username, password, cb) => {
    User.findOne({ where: { email: username } })
      .then(user => {
        if (!user) {
          return cb(null, false, req.flash('error_messages', '此Email尚未註冊！'))
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return cb(null, false, req.flash('error_messages', '帳號或密碼錯誤！'))
        }
        return cb(null, user)
      })
  }
))

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants', attributes: ['id'] }
    ]
  }).then(user => {
    user = user.toJSON()
    return cb(null, user)
  })
})

module.exports = passport