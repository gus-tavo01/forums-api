const { Router } = require('express');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ApiResponse = require('../common/ApiResponse');
const LoginsService = require('../services/Logins.Service');
const UsersService = require('../services/Users.Service');

// api/v0/auth
class AuthController {
  constructor() {
    this.router = Router();
    this.loginsService = new LoginsService();
    this.usersService = new UsersService();

    this.router.post('/login', this.login);
    this.router.post('/register', this.register);
    this.router.post(
      '/users/:userId/password',
      passport.authenticate('jwt', { session: false }),
      this.resetPassword
    );
  }

  login = async (req, res) => {
    const { username, password } = req.body;
    const apiResponse = new ApiResponse();
    try {
      const serviceResponse = await this.loginsService.findByUsername(username);
      if (serviceResponse.fields.length) {
        apiResponse.badRequest(
          'Invalid username field',
          serviceResponse.fields
        );
        return res.status(apiResponse.statusCode).json(apiResponse);
      }

      if (!serviceResponse.result) {
        apiResponse.unauthorized('Invalid credentials');
        return res.status(apiResponse.statusCode).json(apiResponse);
      }
      const account = serviceResponse.result;
      const passwordMatch = await bcrypt.compare(
        password,
        account.passwordHash
      );
      if (!passwordMatch) {
        apiResponse.unauthorized('Invalid credentials');
        return res.status(apiResponse.statusCode).json(apiResponse);
      }

      const secret = process.env.JWT_SECRET;
      const expiresIn = process.env.TOKEN_EXPIRATION;
      const payload = {
        iat: Date.now(),
        sub: account.id,
      };
      const token = jsonwebtoken.sign(payload, secret, { expiresIn });
      const result = { token, expiresIn };
      apiResponse.ok(result);
    } catch (error) {
      apiResponse.internalServerError(error.message);
      console.log(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  register = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { username, email, dateOfBirth, password } = req.body;

      // Step find username if already exist
      const getUserResponse = await this.loginsService.findByUsername(username);
      if (getUserResponse.result) {
        apiResponse.conflict('This username already exists');
        return res.response(apiResponse);
      }

      // TODO
      // validate request body here

      // Step generate hashed password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // Step create login account
      const login = { username, passwordHash };
      const createLoginResponse = await this.loginsService.create(login);
      if (createLoginResponse.fields.length) {
        apiResponse.badRequest(
          'You have some errors',
          createLoginResponse.fields
        );
        return res.response(apiResponse);
      }
      if (!createLoginResponse.result) {
        apiResponse.unprocessableEntity(
          'Login account cannot be created, please try again later'
        );
        return res.response(apiResponse);
      }

      // Step create user profile
      const user = { username, email, dateOfBirth };
      const createUserResponse = await this.usersService.add(user);
      if (createUserResponse.fields.length) {
        apiResponse.badRequest('Check for errors', createUserResponse.fields);
        return res.response(apiResponse);
      }
      if (!createUserResponse.result) {
        apiResponse.unprocessableEntity(
          'User cannot be created, please try again later'
        );
        return res.response(apiResponse);
      }
      apiResponse.created(createUserResponse);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.response(apiResponse);
  };

  resetPassword = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { userId } = req.params;
      const { password } = req.body;

      // TODO:
      // validate password criteria

      // Step get user
      const getUserResponse = await this.usersService.getById(userId);
      if (getUserResponse.fields.length) {
        apiResponse.badRequest('Invalid user id provided');
        return res.response(apiResponse);
      }
      if (!getUserResponse.result) {
        apiResponse.notFound('User is not found :o');
        return res.response(apiResponse);
      }
      const { username } = getUserResponse.result;

      // Step get login account
      const getUsernameResponse = await this.loginsService.findByUsername(
        username
      );
      if (getUsernameResponse.fields.length) {
        apiResponse.unprocessableEntity(
          'Cannot reset the password, try again later'
        );
        return res.response(apiResponse);
      }
      if (!getUsernameResponse.result) {
        apiResponse.unprocessableEntity(
          'Cannot reset the password, try again later'
        );
        return res.response(apiResponse);
      }
      const loginId = getUsernameResponse.result.id;

      // Step generate new pwd
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // TODO:
      // Step validate it is a self pwd reset
      // auth requester user === params.userId

      // Step update account password
      const updatePwd = { passwordHash };
      const updatePwdResponse = await this.loginsService.update(
        loginId,
        updatePwd
      );
      if (updatePwdResponse.fields.length) {
        apiResponse.badRequest('Invalid password bro');
        return res.response(apiResponse);
      }
      if (!updatePwdResponse.result) {
        apiResponse.unprocessableEntity(
          'Cannot update the password, try again later'
        );
        return res.response(apiResponse);
      }
      apiResponse.ok('Password has been reset successfully');
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };
}

module.exports = AuthController;
