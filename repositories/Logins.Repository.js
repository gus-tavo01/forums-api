const Login = require('../models/Login');

class LoginsRepository {
  add = async (login) => {
    const newLogin = new Login(login);
    return newLogin.save();
  };

  findByUsername = async (username) => {
    return Login.findOne({ username });
  };

  findById = async (id) => {
    return Login.findById(id);
  };

  modify = async (id, patch) => {
    return Login.findByIdAndUpdate(id, patch);
  };

  // remove
}

module.exports = LoginsRepository;
