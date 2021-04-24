const { Router } = require('express');
const useJwtAuth = require('../middlewares/useJwtAuth');
const ApiResponse = require('../common/ApiResponse');
const ForumsService = require('../services/Forums.Service');
const ForumRanges = require('../common/constants/forumSizeRanges');

// api/v0/forums
class ForumsController {
  constructor() {
    this.router = Router();
    this.forumsService = new ForumsService();

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
        page: 1,
        pageSize: 15,
        sortBy: 'lastActivity',
        sortOrder: 'desc',
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
      };
      const { forumSize } = req.query;

      if (forumSize) {
        filters.forumSize = ForumRanges[forumSize];
      }

      const response = await this.forumsService.get(filters);
      apiResponse.ok(response.result);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { user } = req;
      const { name, description } = req.body;
      // business validations before create forum
      const forum = {
        name,
        description,
        author: user.username,
      };

      const response = await this.forumsService.create(forum);
      if (response.fields.length) {
        apiResponse.badRequest('Check for errors');
        return res.response(apiResponse);
      }
      if (!response.result) {
        apiResponse.unprocessableEntity(
          'Forum cannot be created, try again later'
        );
        return res.repsonse(apiResponse);
      }
      apiResponse.created(response.result);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  // update

  // delete
}

module.exports = ForumsController;
