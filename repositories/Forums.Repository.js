const Forum = require('../models/Forum');
const Participant = require('../models/Participant');
const BaseRepository = require('./Base.Repository');
const mapForum = require('../utilities/mappers/forum');
const mapForums = require('../utilities/mappers/forums');

class ForumsRepository extends BaseRepository {
  constructor() {
    super(Forum, mapForum);
  }

  find = async (filters) => {
    const filter = {};
    const options = {};

    if (filters.topic) {
      filter.topic = new RegExp(`.*${filters.topic}.*`, 'i');
    }

    if (filters.author) {
      filter.author = new RegExp(`.*${filters.author}.*`, 'i');
    }

    if (filters.public !== undefined) {
      filter.isPrivate = !filters.public;
    }

    if (filters.isActive !== undefined) {
      filter.isActive = filters.isActive;
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

    const forumsList = await Forum.paginate(filter, options);
    return mapForums(forumsList);
  };

  findByUser = async (userId, filters) => {
    const filter = {};
    const options = {};

    if (filters.topic) filter.topic = new RegExp(`.*${filters.topic}.*`, 'i');

    if (filters.author)
      filter.author = new RegExp(`.*${filters.author}.*`, 'i');

    if (filters.public !== undefined) {
      filter.isPrivate = filters.public === 'true' ? false : true;
    }

    if (filters.isActive !== undefined) filter.isActive = filters.isActive;

    if (filters.page) options.page = filters.page;

    if (filters.pageSize) options.limit = filters.pageSize;

    if (filters.sortBy || filters.sortOrder)
      options.sort = {
        [filters.sortBy]: filters.sortOrder,
      };

    // Step get forum [ids] where user is participant
    const userForums = await Participant.find({ userId });
    const userForumIds = userForums.map((p) => p.forumId);

    // filter forums where if private then user must be participant
    const query = {
      ...filter,
      $expr: {
        $cond: [
          { $eq: ['$isPrivate', true] },
          { $in: ['$_id', userForumIds] },
          true,
        ],
      },
    };

    const forumsList = await Forum.paginate(query, options);
    return mapForums(forumsList);
  };
}

module.exports = ForumsRepository;
