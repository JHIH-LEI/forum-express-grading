const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const helpers = require('../_helpers')

module.exports = (app, passport) => {
  // 登陸驗證
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    return res.redirect('/signin')
  }
  // 管理員身份驗證
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).isAdmin) {
        return next()
      }
      return res.redirect('/')
    }
    return res.redirect('/signin')
  }

  // 確定登陸使用者是否等於被操作的使用者
  const isSelfUser = (req, res, next) => {
    if (req.params.id !== helpers.getUser(req).id.toString()) {
      req.flash('error_messages', '不可修改非本人資料！')
      return res.redirect(`/users/${helpers.getUser(req).id}`)
    }
    next()
  }

  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants/:id/:commentId', authenticated, restController.getRestaurant)
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)
  app.get('/restaurants', authenticated, restController.getRestaurants)
  // 跟評論有關
  app.post('/comments/:restaurantsId', authenticated, commentController.postComment)
  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
  app.put('/comments/:id/:restaurantId', authenticated, commentController.putComment)

  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
  // 與使用者操作有關
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
  // 與類別操作有關
  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategories)
  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signinPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signin)
  app.get('/logout', userController.logout)
  // 個人檔案
  app.get('/users/:id/edit', authenticated, isSelfUser, userController.editUser)
  app.get('/users/:id', authenticated, userController.getUser)
  app.put('/users/:id', authenticated, isSelfUser, upload.fields([{ name: 'avatar' }, { name: 'banner' }]), userController.putUser)

}