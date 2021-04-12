const { Router } = require('express');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ApiResponse = require('../common/ApiResponse');
const LoginsService = require('../services/Logins.Service');

// api/v0/auth
class AuthController {
  constructor() {
    this.router = Router();
    this.router.post('/login', this.login);
    this.router.post('/register', this.register);
    this.router.get(
      '/protected',
      passport.authenticate('jwt', { session: false }),
      this.authRoute
    );
    this.loginsService = new LoginsService();
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
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  // password reset?
  register = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { username } = req.body;
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(req.body.password, salt);
      const response = await this.loginsService.create({
        username,
        passwordHash,
      });
      apiResponse.created(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };

  authRoute = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      apiResponse.ok({ message: 'You did it here' });
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.status(apiResponse.statusCode).json(apiResponse);
  };
}

module.exports = AuthController;
