const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');
const useAuth = require('../middlewares/useJwtAuth');
const UsersService = require('../services/Users.Service');
const ForumsRepository = require('../repositories/Forums.Repository');

// api/v0/users
class UsersController {
  constructor() {
    this.router = Router();
    this.usersService = new UsersService();
    this.forumsRepo = new ForumsRepository();

    // register endpoint routes
    this.router.get('/', this.get);
    this.router.get('/:id', this.getById);
    this.router.get('/:id/forums', useAuth, this.getPrivateForums);
  }

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const filters = req.query;
      const response = await this.usersService.get(filters);
      if (response.fields.length) {
        apiResponse.badRequest('Check for errors', response.fields);
        return res.response(apiResponse);
      }
      apiResponse.ok(response.result);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  getById = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id } = req.params;
      const response = await this.usersService.getById(id);
      if (!response.result) {
        apiResponse.notFound('User is not found');
        return res.response(apiResponse);
      }
      apiResponse.ok(response.result);
    } catch (error) {
      apiResponse.internalServerError(error.message);
      console.log(error);
    }
    return res.response(apiResponse);
  };

  getPrivateForums = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { user } = req;
      const { id } = req.params;
      const defaultFilters = {
        page: 1,
        pageSize: 15,
        sortOrder: 'desc',
        sortBy: 'createDate',
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
        author: user.username,
      };

      // Step verify resource user id exist
      const userResponse = await this.usersService.getById(id);
      if (userResponse.fields.length) {
        apiResponse.badRequest('Invalid user id');
        return res.response(apiResponse);
      }
      if (!userResponse.result) {
        apiResponse.badRequest('User resource is not found');
        return res.response(apiResponse);
      }
      const resourceUserData = userResponse.result;

      // Step validate auth user is is eq to resource id
      if (user.username !== resourceUserData.username) {
        apiResponse.forbidden('Cannot view forums from another user');
        return res.response(apiResponse);
      }

      // Step get user own forums
      const forumsResponse = await this.forumsRepo.find(filters);
      apiResponse.ok(forumsResponse);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }

    return res.response(apiResponse);
  };

  // delete
  // patch
}

module.exports = UsersController;
