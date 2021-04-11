const Model = require('../models/Forum');

class ForumsRepository {
  add = async (forum) => {
    const newForum = new Model(forum);
    return newForum.save();
  };

  find = async (filters) => {
    const filter = {};

    if (filters.name) {
      filter.name = new RegExp(`.*${filters.name}.*`);
    }

    if (filters.author) {
      filter.author = new RegExp(`.*${filters.author}.*`);
    }

    if (filters.forumSize) {
      const { from, to } = filters.forumSize;
      filter.$where = `this.participants.length >= ${from} && this.participants.length <= ${to}`;
    }
    return Model.find(filter);
  };

  // findById
  // remove
  // modify = (id, patch) => {}
}

module.exports = ForumsRepository;
