const CommentsRepository = require('../repositories/Comments.Repository');

class CommentsService {
  constructor() {
    this.commentsRepo = new CommentsRepository();
  }

  get = async (filters) => {
    try {
      const result = await this.commentsRepo.find(filters);
      return { payload: result, fields: [] };
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = CommentsService;
