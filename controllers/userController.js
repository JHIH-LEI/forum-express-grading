const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')
const userService = require('../services/userService')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    userService.signUp(req, res, (data) => {
      if (data.status === 'error') {
        const { name, email, password, passwordCheck } = data.user
        req.flash('error_messages', `${data.message}`)
        return res.render('signup', { name, email, password, passwordCheck })
      }
      req.flash('success', `${data.message}`)
      return res.redirect(307, '/signin')
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
  },

  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      const { status, totalComments, totalFavoritedRestaurants, totalFollowers, totalFollowings, totalPage, next, prev,
        isFollowed, user } = data
      if (status === 'error') {
        req.flash('error_messages', '找不到使用者,已返回至您的個人檔案！')
        return res.redirect(`/users/${helpers.getUser(req).id}`)
      }
      if (status === 'success') {
        return res.render('profile', {
          user,
          totalComments, totalFavoritedRestaurants, totalFollowers, totalFollowings,
          totalPage, next, prev,
          isFollowed,
        })
      }
    })
  },

  editUser: async (req, res) => {
    try {
      const { id } = req.params
      // 把編輯資料傳到前端
      const user = await User.findByPk(id, { attributes: ['id', 'name'] })
      res.render('editProfile', { user: user.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  },

  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', `${data.message}`)
        return res.redirect('back')
      }
      if (data.status === 'success') {
        req.flash('success_messages', `${data.message}`)
        return res.redirect(`/users/${req.params.id}`)
      }
    })
  },

  addFavorite: async (req, res) => {
    try {
      await Favorite.create({
        RestaurantId: req.params.restaurantId,
        UserId: req.user.id,
      })
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  removeFavorite: async (req, res) => {
    try {
      const favorite = await Favorite.findOne({
        where: {
          RestaurantId: req.params.restaurantId,
          UserId: req.user.id
        }
      })
      await favorite.destroy()
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  addLike: async (req, res) => {
    try {
      await Like.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      })
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  removeLike: async (req, res) => {
    try {
      const like = await Like.findOne({
        where: {
          RestaurantId: req.params.restaurantId,
          UserId: req.user.id
        }
      })
      await like.destroy()
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      const { users, topUser } = data
      return res.render('topUser', { users, topUser })
    })
  },

  addFollowing: async (req, res) => {
    try {
      await Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId
      })
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  removeFollowing: async (req, res) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })
      await followship.destroy()
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  getFollowers: async (req, res) => {
    try {
      const user = await User.findOne({
        where: { id: req.params.userId, },
        include: [{
          model: User, as: 'Followers',
          attributes: ['id', 'name', 'avatar', 'banner']
        }]
      })
      return res.render('list', { user: user.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  },

  getFollowings: (req, res) => {
    userService.getFollowings(req, res, (data) => {
      const { user } = data
      return res.render('list', { user })
    })
  },

  getFavoritedRestaurants: async (req, res) => {
    try {
      let user = await User.findOne({
        where: { id: req.params.userId },
        include: [{
          model: Restaurant, as: 'FavoritedRestaurants', attributes: ['id', 'name', 'image', 'description']
        }]
      })

      user.FavoritedRestaurants = user.FavoritedRestaurants.map(rest => ({
        ...rest.dataValues,
        description: rest.description.length > 50 ? rest.description.substring(0, 50) + '...' : rest.description
      }))
      return res.render('list', { user: user.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = userController