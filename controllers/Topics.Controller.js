const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');
const TopicsService = require('../services/Topics.Service');

class TopicsController {
  constructor() {
    this.router = Router();
    this.topicsService = new TopicsService();

    this.router.get('/:id', this.getById);
    this.router.post('/', this.post);
  }

  getById = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id } = req.params;
      const response = await this.topicsService.getById(id);
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      // const response = this.topicsService
      apiResponse.ok();
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  // get
  // delete
  // patch
}

module.exports = TopicsController;
