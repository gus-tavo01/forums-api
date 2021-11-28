const { Router } = require('express');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const useJwtAuth = require('../middlewares/useJwtAuth');
const ApiResponse = require('../common/ApiResponse');

const AccountsRepository = require('../repositories/Accounts.Repository');
const UsersRepository = require('../repositories/Users.Repository');

const EmailService = require('../services/Email.Service');
const CloudinaryService = require('../services/Cloudinary.Service');

// local validation tool (deprecated)
const { validate: oldValidate } = require('../common/processors/errorManager');

const { validateModel, validations, validate } = require('js-validation-tool');
const pwdResetValidator = require('../utilities/validators/auth/pwdReset.validator');
const registerValidator = require('../utilities/validators/auth/register.validator');
const loginValidator = require('../utilities/validators/auth/login.validator');

const CloudinaryFolders = require('../common/constants/cloudinaryFolders');

// api/v0/auth
class AuthController {
  constructor() {
    this.router = Router();

    // unit of work
    this.accountsRepo = new AccountsRepository();
    this.usersRepo = new UsersRepository();

    this.emailService = new EmailService();
    this.cloudinaryService = new CloudinaryService();

    this.router.post('/login', this.login);
    this.router.post('/register', this.register);
    this.router.put('/users/:userId/password', useJwtAuth, this.resetPassword);
  }

  login = async (req, res) => {
    const { username, password } = req.body;
    const apiResponse = new ApiResponse();
    try {
      // Step validate entity
      const { isValid, fields } = await validateModel(loginValidator, req.body);
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
      const { avatar, username, email, password, dateOfBirth } = req.body;

      // TODO:
      // replace old local validator by js validation tool
      // Step validate input fields
      const { isValid, fields } = await oldValidate(
        req.body,
        registerValidator
      );
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step validate account does not exist yet
      const [foundAccount, { docs: foundEmailUser }] = await Promise.all([
        this.accountsRepo.findByUsername(username),
        this.usersRepo.find({ email }),
      ]);

      if (foundAccount || foundEmailUser.length) {
        const apiErr = foundAccount ? 'Username' : 'Email';
        apiResponse.conflict(`This ${apiErr} is already on use`);
        return res.response(apiResponse);
      }

      // Step upload avatar image on cloudinary
      let imageId = null;
      if (avatar) {
        const uploadedImageId = await this.cloudinaryService.uploadImage(
          avatar,
          CloudinaryFolders.avatars
        );
        if (!uploadedImageId) {
          apiResponse.unprocessableEntity('Error uploading the avatar image');
          return res.response(apiResponse);
        }
        imageId = uploadedImageId;
      }

      // Step generate hashed password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // Step create user account and profile
      const [createdProfile, createdAccount] = await Promise.all([
        this.usersRepo.add({
          avatar: imageId,
          username,
          email,
          dateOfBirth,
        }),
        this.accountsRepo.add({
          username,
          passwordHash,
        }),
      ]);

      // Step rollback when errors on user creation
      const rollback = [];

      if (!createdProfile || !createdAccount) {
        if (!createdProfile && createdAccount)
          rollback.push(this.accountsRepo.remove(createdAccount.id));

        if (createdProfile && !createdAccount)
          rollback.push(this.usersRepo.remove(createdProfile.id));
      }

      await Promise.all(rollback);

      if (rollback.length) {
        apiResponse.unprocessableEntity(
          'User account/profile cannot be created, please try again later'
        );
        return res.response(apiResponse);
      }

      await this.emailService.send({
        to: email,
        from: process.env.APP_EMAIL,
        subject: 'Welcome to Forums App!!',
        html: `<h2>Hello ${username}!</h2> you have created a new account, please enjoy...`,
      });

      apiResponse.created(createdAccount.username);
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
      const [
        { isValid: isModelValid, fields: modelFields },
        { isValid: areParamsValid, fields: paramsFields },
      ] = await Promise.all([
        validateModel(pwdResetValidator, req.body),
        validate([
          validations.string.isNotEmpty('userId', userId),
          validations.string.isMongoId('userId', userId),
        ]),
      ]);

      if (!isModelValid || !areParamsValid) {
        apiResponse.badRequest('Validation errors', [
          ...modelFields,
          ...paramsFields,
        ]);
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
