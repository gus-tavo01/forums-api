const Comment = require('../models/Comment');

class CommentsRepository {
  find = async (filters) => {
    const filter = { topicId: filters.topicId };
    const options = {
      page: 1,
    };

    if (filters.message) {
      filter.message = new RegExp(`.*${filters.message}.*`);
    }

    if (filters.page) {
      options.page = filters.page;
    }

    if (filters.pageSize) {
      options.limit = filters.pageSize;
    }

    return Comment.paginate(filter, options);
  };

  add = async (comment) => {
    const newComment = new Comment(comment);
    return newComment.save();
  };

  remove = async (commentId) => {
    return Comment.findByIdAndRemove(commentId);
  };
}

module.exports = CommentsRepository;
