const express = require('express')
const router = express.Router()

const passport = require('../config/passport')
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const helpers = require('../_helpers')

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
    return res.redirect(`/users/${req.params.id}`)
  }
  next()
}

router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, restController.getTopRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id/:commentId', authenticated, restController.getRestaurant)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)
// 跟評論有關
router.post('/comments/:restaurantsId', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
router.put('/comments/:id/:restaurantId', authenticated, commentController.putComment)

router.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
// 與使用者操作有關
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
// 與類別操作有關
router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategories)
router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signinPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signin)
router.get('/logout', userController.logout)
// 個人檔案
router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id/edit', authenticated, isSelfUser, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, isSelfUser, upload.fields([{ name: 'avatar' }, { name: 'banner' }]), userController.putUser)
// 收藏
router.get('/favorite/restaurants/:userId', authenticated, userController.getFavoritedRestaurants)
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
// 讚
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)
// 追蹤
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)
router.get('/followings/:userId', authenticated, userController.getFollowings)
// 追蹤者
router.get('/followers/:userId', authenticated, userController.getFollowers)

module.exports = router