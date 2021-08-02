const Model = require('../models/Forum');
const ForumRanges = require('../common/constants/forumSizeRanges');

class ForumsRepository {
  add = async (forum) => {
    const newForum = new Model(forum);
    return newForum.save();
  };

  find = async (filters) => {
    const filter = {};
    const options = {};

    if (filters.name) {
      filter.name = new RegExp(`.*${filters.name}.*`, 'i');
    }

    if (filters.author) {
      filter.author = new RegExp(`.*${filters.author}.*`, 'i');
    }

    if (filters.forumSize) {
      const forumSize = ForumRanges[forumSize];
      const { from, to } = filters.forumSize;
      filter.$where = `this.participants.length >= ${from} && this.participants.length <= ${to}`;
    }

    if (filters.public !== undefined) {
      filter.isPrivate = !filters.public;
    }

    if (filters.page) {
      options.page = filters.page;
    }

    if (filters.pageSize) {
      options.limit = filters.pageSize;
    }

    if (filters.sortBy || filters.sortOrder) {
      options.sort = {
        [filters.sortBy]: filters.sortOrder,
      };
    }

    return Model.paginate(filter, options);
  };

  findById = async (id) => {
    return Model.findById(id);
  };

  remove = async (id) => {
    return Model.findByIdAndDelete(id);
  };

  modify = async (id, patch) => {
    return Model.findByIdAndUpdate(id, patch, { new: true });
  };
}

module.exports = ForumsRepository;
