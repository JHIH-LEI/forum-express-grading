const commentService = require('../../services/commentService')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => res.json(data))
  },

  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => res.json(data))
  },

  putComment: (req, res) => {
    commentService.putComment(req, res, (data) => res.json(data))
  }
}

module.exports = commentController