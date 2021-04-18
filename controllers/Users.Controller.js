const { Router } = require('express');
const passport = require('passport');
const ApiResponse = require('../common/ApiResponse');
const UsersService = require('../services/Users.Service');
const LoginsService = require('../services/Logins.Service');
const bcrypt = require('bcrypt');

// api/v0/users
class UsersController {
  constructor() {
    this.router = Router();
    this.usersService = new UsersService();
    this.loginsService = new LoginsService();

    // register endpoint routes
    this.router.get('/', this.get);
    this.router.get('/:id', this.getById);
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
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.response(apiResponse);
  };

  getById = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id } = req.params;
      const response = await this.usersService.getById(id);
      if (!response.payload) {
        apiResponse.notFound('User is not found');
        return res.response(apiResponse);
      }
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error.message);
      console.log(error);
    }
    return res.response(apiResponse);
  };

  // delete
  // patch
}

module.exports = UsersController;
