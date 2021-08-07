const { Router } = require('express');
const useJwtAuth = require('../middlewares/useJwtAuth');
const ApiResponse = require('../common/ApiResponse');
const ForumsRepository = require('../repositories/Forums.Repository');
// validators
const validate = require('../common/processors/validate');
const postForumValidator = require('../utilities/validators/post.forum.validator');

// api/v0/forums
class ForumsController {
  constructor() {
    this.router = Router();
    this.forumsRepo = new ForumsRepository();

    this.router.get('/', this.get);
    this.router.post('/', useJwtAuth, this.post);

    // this.router.get('/:id', this.controller.get);
    // this.router.put('/:id', this.put);
    // this.router.delete('/:id', this.delete);
  }

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const defaultFilters = {
        isActive: true,
        page: 1,
        pageSize: 15,
        sortBy: 'lastActivity',
        sortOrder: 'desc',
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
        public: true,
      };

      const response = await this.forumsRepo.find(filters);
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { user } = req;
      const { topic, description, isPrivate } = req.body;
      const forum = {
        topic,
        description,
        author: user.username,
        isPrivate,
      };

      // Step invoke model validator
      const { isValid, fields } = await validate(forum, postForumValidator);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step create forum
      const response = await this.forumsRepo.add(forum);
      if (!response) {
        apiResponse.unprocessableEntity(
          'Forum cannot be created, try again later'
        );
        return res.response(apiResponse);
      }
      apiResponse.created(response);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }

    return res.response(apiResponse);
  };

  // update

  // delete
}

module.exports = ForumsController;
