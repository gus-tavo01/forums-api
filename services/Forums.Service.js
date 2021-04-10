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
      return result;
    } catch (error) {
      // error during creation
    }
  };

  get = async (filters) => {
    try {
      // get by filters
      const result = await this.forumsRepository.find(filters);
      // create service response
      return result;
    } catch (error) {
      // repository error
      // service error
    }
  };
}

module.exports = ForumsService;
