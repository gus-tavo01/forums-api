const Model = require('../models/Forum');

class ForumsRepository {
  add = async (forum) => {
    const newForum = new Model(forum);
    return newForum.save();
  };

  find = async (filters) => {
    // extract filters
    const { name, author, size } = filters;
    // create filter object
    const filter = {};
    return Model.find(filter);
  };

  // findById
  // remove
  // modify = (id, patch) => {}
}

module.exports = ForumsRepository;
