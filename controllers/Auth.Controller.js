const { Router } = require('express');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const useJwtAuth = require('../middlewares/useJwtAuth');
const ApiResponse = require('../common/ApiResponse');

const AccountsRepository = require('../repositories/Accounts.Repository');
const UsersRepository = require('../repositories/Users.Repository');

const EmailsService = require('../services/Emails.Service');

// validators
const validations = require('../utilities/validations');
const {
  validate,
  executeValidations,
} = require('../common/processors/errorManager');
const postAccountValidator = require('../utilities/validators/post.account.validator');
const loginValidator = require('../utilities/validators/login.validator');

// api/v0/auth
class AuthController {
  constructor() {
    this.router = Router();

    // unit of work
    this.accountsRepo = new AccountsRepository();
    this.usersRepo = new UsersRepository();

    this.emailsService = new EmailsService();

    this.router.post('/login', this.login);
    this.router.post('/register', this.register);
    this.router.post('/users/:userId/password', useJwtAuth, this.resetPassword);
  }

  login = async (req, res) => {
    const { username, password } = req.body;
    const apiResponse = new ApiResponse();
    try {
      // Step validate entity
      const { isValid, fields } = await validate(req.body, loginValidator);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get user account
      const foundAccount = await this.accountsRepo.findByUsername(username);
      if (!foundAccount) {
        apiResponse.unauthorized('Invalid credentials');
        return res.response(apiResponse);
      }

      // Step verify passwords match
      const passwordMatch = await bcrypt.compare(
        password,
        foundAccount.passwordHash
      );
      if (!passwordMatch) {
        apiResponse.unauthorized('Invalid credentials');
        return res.response(apiResponse);
      }

      // Step generate access token
      const secret = process.env.JWT_SECRET;
      const expInMins = process.env.TOKEN_EXPIRATION;
      const expiresIn = Math.floor(Date.now() / 1000) + expInMins * 60;
      const token = jsonwebtoken.sign(
        {
          iat: Date.now(),
          sub: foundAccount.id,
          exp: expiresIn,
        },
        secret
      );
      apiResponse.ok({
        token,
        expiresIn: `${expInMins} Minutes`,
      });
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  register = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { username, email, password, dateOfBirth } = req.body;

      // Step validate input fields
      const { isValid, fields } = await validate(
        req.body,
        postAccountValidator
      );
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step validate account does not exist yet
      const [foundAccount, [foundEmailUser]] = await Promise.all([
        this.accountsRepo.findByUsername(username),
        this.usersRepo.find({ email }),
      ]);
      if (foundAccount || foundEmailUser) {
        const apiErr = foundAccount ? 'Username' : 'Email';
        apiResponse.conflict(`This ${apiErr} is already on use`);
        return res.response(apiResponse);
      }

      // Step create user profile
      const createdProfile = await this.usersRepo.add({
        username,
        email,
        dateOfBirth,
      });
      if (!createdProfile) {
        apiResponse.unprocessableEntity(
          'User profile cannot be created, please try again later'
        );
        return res.response(apiResponse);
      }

      // Step generate hashed password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // Step create login account
      const createdAccount = await this.accountsRepo.add({
        username,
        passwordHash,
      });
      if (!createdAccount) {
        // Step rollback user profile
        await this.usersRepo.remove(createdProfile.id);
        apiResponse.unprocessableEntity(
          'Login account cannot be created, please try again later'
        );
        return res.response(apiResponse);
      }
      apiResponse.created(createdAccount.username);

      const emailContent = {
        to: email,
        from: process.env.APP_EMAIL,
        subject: 'Welcome to Forums App!!',
        html: `<h2>Hello ${username}!</h2> you have created a new account, please enjoy...`,
      };
      await this.emailsService.send(emailContent);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  resetPassword = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      // logged in user
      const { username: requesterUsername, id: requestorUserId } = req.user;
      const { userId } = req.params;
      const { password } = req.body;

      // Step validate request data
      const { isValid, fields } = await executeValidations([
        validations.isEmpty(password, 'password'),
        validations.isEmpty(userId, 'userId'),
        validations.isMongoId(userId, 'userId'),
      ]);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get user
      const foundUserProfile = await this.usersRepo.findById(userId);
      if (!foundUserProfile) {
        apiResponse.notFound('User is not found');
        return res.response(apiResponse);
      }
      const { username: targetUsername } = foundUserProfile;

      // Step validate if is self pwd reset
      if (requesterUsername !== targetUsername) {
        apiResponse.forbidden('Cannot update another users password');
        return res.response(apiResponse);
      }

      // Step generate new pwd
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // Step update account password
      const updatedAccount = await this.accountsRepo.modify(requestorUserId, {
        passwordHash,
      });
      if (!updatedAccount) {
        // Step validate update process was successful
        apiResponse.unprocessableEntity(
          'Cannot update the password, try again later'
        );
        return res.response(apiResponse);
      }
      apiResponse.ok(targetUsername);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };
}

module.exports = AuthController;
