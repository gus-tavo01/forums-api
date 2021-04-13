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
  }

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id } = req.params;
      const response = this.usersService.findById(id);
      if (response.fields.length) {
        apiResponse.badRequest('Check for errors', response.fields);
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    res.status(apiResponse.status).json(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { username, email, dateOfBirth, password } = req.body;
      const getUserResponse = await this.loginsService.findByUsername(username);
      if (getUserResponse.result) {
        apiResponse.conflict('This username already exists');
        return res.status(apiResponse.statusCode).json(apiResponse);
      }

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      const login = { username, passwordHash };
      const createLoginResponse = await this.loginsService.create(login);
      if (createLoginResponse.fields.length) {
        apiResponse.badRequest(
          'You have some errors',
          createLoginResponse.fields
        );
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      if (!createLoginResponse.result) {
        apiResponse.unprocessableEntity(
          'Login account cannot be created, please try again later'
        );
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      const user = { username, email, dateOfBirth };
      const createUserResponse = await this.usersService.add(user);
      if (createUserResponse.fields.length) {
        apiResponse.badRequest('Check for errors', createUserResponse.fields);
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      if (!createUserResponse.result) {
        apiResponse.unprocessableEntity(
          'User cannot be created, please try again later'
        );
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      apiResponse.created(createUserResponse);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };
}

module.exports = UsersController;
