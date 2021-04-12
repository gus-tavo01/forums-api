const { Router } = require('express');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiResponse = require('../common/ApiResponse');
const LoginsService = require('../services/Logins.Service');

// api/v0/auth
class AuthController {
  constructor() {
    this.router = Router();
    this.router.post('/login', this.login);
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
}

module.exports = AuthController;
