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
    this.router.post(
      '/',
      passport.authenticate('jwt', { session: false }),
      this.post
    );
    this.router.get('/:id', this.getById);
  }

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const filters = req.query;
      const response = await this.usersService.get(filters);
      if (response.fields.length) {
        apiResponse.badRequest('Check for errors', response.fields);
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  getById = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id } = req.params;
      const response = await this.usersService.findById(id);
      if (!response) {
        apiResponse.notFound('User is not found');
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };
}

module.exports = UsersController;
