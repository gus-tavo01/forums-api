const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');
const ForumsService = require('../services/Forums.Service');

// api/v0/forums
class ForumsController {
  constructor() {
    this.router = Router();
    this.forumsService = new ForumsService();

    this.router.get('/', this.get);
    this.router.post('/', this.post);

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
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
      };

      const result = await this.forumsService.get(filters);
      apiResponse.ok(result);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const forum = req.body;
      // business validations before create forum
      const result = await this.forumsService.create(forum);
      // validate service response has succeed
      apiResponse.created(result);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };
}

module.exports = ForumsController;
