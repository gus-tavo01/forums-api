const TopicsRepository = require('../repositories/Topics.Repository');

class TopicsService {
  constructor() {
    this.topicsRepository = new TopicsRepository();
  }

  getById = async (id) => {
    try {
      // id is valid?
      // validate
      const result = await this.topicsRepository.findById(id);
      return result;
    } catch (error) {
      // error actions
    }
  };

  // create
  // get = async (filters) => {}
  // update
  // remove
}

module.exports = TopicsService;
