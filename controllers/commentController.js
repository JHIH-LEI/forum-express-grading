const db = require('../models')
const Comment = db.Comment
const commentService = require('../services/commentService')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      if (data.status === 'error') {
        const { message, RestaurantId, commentId } = data
        req.flash('error_messages', `${message}`)
        // 如果有回傳特定的留言id，代表留言已經存在，導向編輯頁
        if (commentId) {
          return res.redirect(`/restaurants/${RestaurantId}/${commentId}`)
        } else {
          return res.redirect('back')
        }
      }
      // 成功就重新導向
      return res.redirect('back')
    })
  },

  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id)
      await comment.destroy()
      return res.redirect(`/restaurants/${comment.RestaurantId}`)
    } catch (err) {
      console.warn(err)
    }
  },

  putComment: async (req, res) => {
    try {
      const { id, restaurantId } = req.params
      const { text } = req.body
      const comment = await Comment.findByPk(id)
      comment.text = text
      await comment.save()
      return res.redirect(`/restaurants/${restaurantId}`)
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = commentController