const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');
const TopicsService = require('../services/Topics.Service');

class TopicsController {
  constructor() {
    this.router = Router();
    this.topicsService = new TopicsService();

    this.router.get('/', this.get);
    this.router.post('/', this.post);
    this.router.get('/:id', this.getById);
    this.router.delete('/:id', this.delete);
  }

  getById = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id } = req.params;
      const response = await this.topicsService.getById(id);
      if (!response.result) {
        apiResponse.notFound('Topic is not found');
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { body } = req;
      const response = this.topicsService.create(body);
      if (!response.result) {
        apiResponse.unprocessableEntity(
          'Topic cannot be created, please try again later'
        );
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const filters = req.query;
      const response = await this.topicsService.get(filters);
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  delete = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  // patch
}

module.exports = TopicsController;
