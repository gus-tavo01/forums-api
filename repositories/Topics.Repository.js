const Topic = require('../models/Topic');

class TopicsRepository {
  add = async (post) => {
    const newPost = new Topic(post);
    return newPost.save();
  };

  find = async (filters) => {
    const filter = {};
    const options = {
      page: 1,
      lean: true,
      leanWithId: true,
    };

    if (filters.name) {
      filter.name = new RegExp(`.*${filters.name}.*`);
    }

    if (filters.forumId) {
      filter.forumId = filters.forumId;
    }

    if (filters.page) {
      options.page = filters.page;
    }

    if (filters.pageSize) {
      options.limit = filters.pageSize;
    }

    return Topic.paginate(filter, options);
  };

  findById = async (id) => {
    return Topic.findById(id);
  };

  remove = async (id) => {
    return Topic.findByIdAndRemove(id);
  };

  modify = async (id, patch) => {
    return Topic.findByIdAndUpdate(id, patch);
  };
}

module.exports = TopicsRepository;
