const User = require('../models/User');

class UsersRepository {
  add = async (user) => {
    const newUser = new User(user);
    return newUser.save();
  };

  findById = async (id) => {
    return User.findById(id);
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

    return User.paginate(filter, options);
  };

  // modify = async () => {}

  remove = async (id) => {
    return User.findByIdAndRemove(id);
  };
}

module.exports = UsersRepository;
