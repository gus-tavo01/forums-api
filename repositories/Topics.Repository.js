const Topic = require('../models/Topic');

class TopicsRepository {
  findById = async (id) => {
    return Topic.findById(id);
  };

  // add = async (topicData) => {};
  // remove = async (id) => {};
  // modify = async (id, patch) => {};
}

module.exports = TopicsRepository;
