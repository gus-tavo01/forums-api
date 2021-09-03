const BaseRepository = require('./Base.Repository');
const Comment = require('../models/Comment');
const mapComment = require('../utilities/mappers/comment');

class CommentsRepository extends BaseRepository {
  constructor() {
    super(Comment, mapComment);
  }

  find = async (filters) => {
    const filter = { forumId: filters.forumId };
    const options = {
      page: 1,
    };

    if (filters.to) filter.to = filters.to;

    if (filters.from) filter.from = filters.from;

    if (filters.message) filter.message = new RegExp(`.*${filters.message}.*`);

    if (filters.page) options.page = filters.page;

    if (filters.pageSize) options.limit = filters.pageSize;

    return Comment.paginate(filter, options);
  };
}

module.exports = CommentsRepository;
