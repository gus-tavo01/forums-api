const Model = require('../models/Forum');

class ForumsRepository {
  add = async (forum) => {
    const newForum = new Model(forum);
    return newForum.save();
  };

  find = async (filters) => {
    const filter = {};
    const options = { page: 1 };

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

    if (filters.page) {
      options.page = filters.page;
    }

    if (filters.pageSize) {
      options.limit = filters.pageSize;
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
    console.log(patch);
    const res = await Model.findByIdAndUpdate(id, patch, { new: true });
    console.log('ressie');
    console.log(res);
    return res;
  };
}

module.exports = ForumsRepository;
