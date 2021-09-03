const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const helpers = require('./_helpers')

const port = process.env.PORT || 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: require('./config/handlebars-helper') })) //handlebars註冊樣板engine
app.set('view engine', 'handlebars') //設定使用handlebars作為樣板engine

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))
app.use(express.static(__dirname + '/upload'))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.selfUser = helpers.getUser(req)
  next()
})

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

require('./routes')(app, passport)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app
