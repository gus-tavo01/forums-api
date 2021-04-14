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
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // error actions
    }
  };

  create = async (topic) => {
    try {
      // validate topic data is valid
      const result = await this.topicsRepository.add(topic);
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle service error
    }
  };

  get = async (filters) => {
    try {
      const result = await this.topicsRepository.find(filters);
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle err
    }
  };

  // update

  remove = async (id) => {
    try {
      const result = await this.topicsRepository.remove(id);
      const serviceResponse = { result, fields: [] };
      return serviceResponse;
    } catch (error) {
      // handle err
    }
  };
}

module.exports = TopicsService;
