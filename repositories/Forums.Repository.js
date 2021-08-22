const Model = require('../models/Forum');
// mappers
const mapForums = require('../utilities/mappers/forums');
const mapForum = require('../utilities/mappers/forum');

class ForumsRepository {
  add = async (forum) => {
    const newForum = await new Model(forum).save();
    return mapForum(newForum);
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

    const forumsList = await Model.paginate(filter, options);
    return mapForums(forumsList);
  };

  findById = async (id) => {
    const forum = await Model.findById(id);
    return mapForum(forum);
  };

  remove = async (id) => {
    const removedForum = await Model.findByIdAndDelete(id);
    return mapForum(removedForum);
  };

  modify = async (id, patch) => {
    const forum = await Model.findByIdAndUpdate(id, patch, { new: true });
    return mapForum(forum);
  };
}

module.exports = ForumsRepository;
