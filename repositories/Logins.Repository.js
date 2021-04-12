const Login = require('../models/Login');

class LoginsRepository {
  add = async (login) => {
    const newLogin = new Login(login);
    return newLogin.save();
  };

  findByUsername = async (username) => {
    return Login.findOne({ username });
  };

  // remove
  // modify
}

module.exports = LoginsRepository;
