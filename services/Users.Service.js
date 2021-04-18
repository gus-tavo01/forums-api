const UsersRepository = require('../repositories/Users.Repository');

class UsersService {
  constructor() {
    this.usersRepository = new UsersRepository();
  }

  add = async (user) => {
    try {
      // user validations
      const result = await this.usersRepository.add(user);
      // create serviceResponse
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle err
    }
  };

  getById = async (id) => {
    try {
      // validate id is valid
      const result = await this.usersRepository.findById(id);
      const serviceResponse = { payload: result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle error
    }
  };

  get = async (filters) => {
    try {
      const result = await this.usersRepository.find(filters);
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle service error
    }
  };
}

module.exports = UsersService;
