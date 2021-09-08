const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const passport = require('../config/passport')
const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController')
const commentController = require('../controllers/api/commentController')

// 使用passport-jwt，驗證token，並回傳req.user
const authenticated = passport.authenticate('jwt', { session: false })

// 查看經過驗證的使用者是否有管理員的權限
const authenticatedAdmin = (req, res, next) => {
  // 如果token驗證成功且找到user，req.user會有資訊
  if (req.user) {
    if (req.user.isAdmin) {
      return next()
    }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

// 確定登陸使用者是否等於被操作的使用者
const isSelfUser = (req, res, next) => {
  if (req.params.id !== req.user.id.toString()) {
    return res.json({ status: 'error', message: '不可修改非本人資料' })
  }
  next()
}

router.get('/admin', authenticated, authenticatedAdmin, (req, res) => res.redirect('/api/admin/restaurants'))
router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)
// 與使用者操作有關
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id/toggleAdmin', authenticated, authenticatedAdmin, adminController.toggleAdmin)
// 類別
router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)
router.get('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticated, authenticatedAdmin, categoryController.postCategories)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.deleteCategory)
// 使用者
router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)
// 跟評論有關
router.post('/comments/:restaurantsId', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticated, authenticatedAdmin, commentController.deleteComment)
router.put('/comments/:id/:restaurantId', authenticated, commentController.putComment)
// 個人檔案
router.get('/users/top', authenticated, userController.getTopUser)
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

module.exports = router