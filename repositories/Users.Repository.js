const User = require('../models/User');

class UsersRepository {
  add = async (user) => {
    const newUser = new User(user);
    return newUser.save();
  };

  findById = async (id) => {
    return User.findById(id);
  };

  // find = async (filters) => {};
  // modify = async () => {}

  remove = async (id) => {
    return User.findByIdAndRemove(id);
  };
}

module.exports = UsersRepository;
