const LoginsRepository = require('../repositories/Logins.Repository');

class LoginsService {
  constructor() {
    this.loginsRepository = new LoginsRepository();
  }

  findByUsername = async (username) => {
    try {
      const result = await this.loginsRepository.findOne(username);
      return result;
    } catch (error) {
      // handle error on service
    }
  };

  create = async (login) => {
    try {
      // validate login is valid
      // username is not empty
      // password has length 6 chars
      const result = await this.loginsRepository.add(login);
      return result;
    } catch (error) {
      // handle service error
    }
  };
}
