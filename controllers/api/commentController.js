const commentService = require('../../services/commentService')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => res.json(data))
  }
}

module.exports = commentController