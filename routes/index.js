const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')

module.exports = (app) => {
  app.get('/', (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', restController.getRestaurants)

  app.get('/admin', (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', adminController.getRestaurants)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
}