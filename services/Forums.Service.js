const forumsMapper = require('../utilities/mappers/forumsList');
const ForumsRepository = require('../repositories/Forums.Repository');

class ForumsService {
  constructor() {
    this.forumsRepository = new ForumsRepository();
  }

  create = async (forum) => {
    try {
      // validate empties and required fields
      const result = await this.forumsRepository.add(forum);
      // map result?
      // create service response
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // error during creation
      console.log(error);
    }
  };

  get = async (filters) => {
    try {
      // get by filters
      const result = await this.forumsRepository.find(filters);
      // create service response
      const mapResult = forumsMapper(result);
      const serviceResponse = { result: mapResult, fields: [] };
      return serviceResponse;
    } catch (error) {
      // repository error
      // service error
    }
  };

  getById = async (id) => {
    try {
      const result = await this.forumsRepository.findById(id);
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle service errors
    }
  };

  update = async (id, patch) => {
    try {
      const result = await this.forumsRepository.modify(id, patch);
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle errors
    }
  };

  delete = async (id) => {
    try {
      const payload = await this.forumsRepository.remove(id);
      const serviceResponse = { payload, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle errors
    }
  };
}

module.exports = ForumsService;
