const User = require('../models/User');
const RepositoryBase = require('./Base.Repository');
const mapProfile = require('../utilities/mappers/profile');
const mapProfiles = require('../utilities/mappers/profiles');

class UsersRepository extends RepositoryBase {
  constructor() {
    super(User, mapProfile);
  }

  findByUsername = async (username) => {
    const user = await User.findOne({ username });
    return mapProfile(user);
  };

  find = async (filters) => {
    const filter = {};
    const options = { page: 1 };

    if (filters.username) {
      filter.username = new RegExp(`.*${filters.username}.*`);
    }

    if (filters.email) {
      filter.email = new RegExp(`.*${filters.email}.*`);
    }

    if (filters.page) {
      options.page = filters.page;
    }

    if (filters.pageSize) {
      options.limit = filters.pageSize;
    }

    const users = await User.paginate(filter, options);
    return mapProfiles(users);
  };
}

module.exports = UsersRepository;
