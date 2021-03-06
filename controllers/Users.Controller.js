const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');
const useAuth = require('../middlewares/useJwtAuth');

const UsersRepository = require('../repositories/Users.Repository');
const ForumsRepository = require('../repositories/Forums.Repository');

const { validate, validateModel, validations } = require('js-validation-tool');
const patchUserValidator = require('../utilities/validators/patch.account.validator');
const customValidations = require('../utilities/validations');

// api/v0/users
class UsersController {
  constructor() {
    this.router = Router();
    this.usersRepo = new UsersRepository();
    this.forumsRepo = new ForumsRepository();

    // register endpoint routes
    this.router.get('/', useAuth, this.get);
    this.router.get('/:id', this.getById);
    this.router.get('/:id/forums', useAuth, this.getUserForums);
    this.router.patch('/:id', this.patch);
  }

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const defaultFilters = {
        page: 1,
        pageSize: 15,
      };
      const filters = { ...defaultFilters, ...req.query };

      // Step validate filters
      const { isValid, fields } = await validate([
        validations.number.isNumeric('page', filters.page),
        validations.number.isNumeric('pageSize', filters.pageSize),
        validations.common.isOptional('username', filters.username),
        validations.string.isNotEmpty('username', filters.username),
        validations.common.isOptional('email', filters.email),
        customValidations.string.isEmail('email', filters.email),
        // validations.common.isOptional('isActive', filters.isActive),
        // validations.string.isString('isActive', filters.isActive),
      ]);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get users
      const response = await this.usersRepo.find(filters);
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  getById = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id } = req.params;

      // Step validate params
      const { isValid, fields } = await validate([
        customValidations.string.isMongoId('id', id),
      ]);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get user
      const user = await this.usersRepo.findById(id);
      if (!user) {
        apiResponse.notFound('User is not found');
        return res.response(apiResponse);
      }

      apiResponse.ok(user);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  getUserForums = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { user } = req;
      const { id: userId } = req.params;
      const defaultFilters = {
        page: 1,
        pageSize: 15,
        sortOrder: 'asc',
        sortBy: 'createDate',
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
      };

      // Step validate request (filters, userId)
      const { isValid, fields } = await validate([
        validations.number.isNumeric('page', filters.page),
        validations.number.isNumeric('pageSize', filters.pageSize),
        validations.common.isOptional('public', filters.public),
        validations.boolean.isBool('public', filters.public),
        validations.common.isOptional('isActive', filters.isActive),
        validations.boolean.isBool('isActive', filters.isActive),
        validations.common.isOptional('author', filters.author),
        validations.string.isNotEmpty('author', filters.author),
        validations.common.isOptional('topic', filters.topic),
        validations.string.isNotEmpty('topic', filters.topic),
        // validations.common.isOneOf(filters.sortBy, ['lastActivity', 'topic']),
        // validations.common.isOneOf(filters.sortOrder, ['asc', 'desc']),
      ]);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step verify resource user id exist
      const foundUser = await this.usersRepo.findById(userId);
      if (!foundUser) {
        apiResponse.unprocessableEntity('User resource is not found');
        return res.response(apiResponse);
      }

      // Step validate auth user has permissions to view
      if (user.username !== foundUser.username) {
        apiResponse.forbidden('Cannot view other users private forums');
        return res.response(apiResponse);
      }

      // Step get user forums where has visibility
      const forumsResponse = await this.forumsRepo.findByUser(userId, filters);
      apiResponse.ok(forumsResponse);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }

    return res.response(apiResponse);
  };

  // getPrivateComments = async (req, res) => {}

  // delete

  patch = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id: userId } = req.params;
      const { body } = req;

      // Step validations
      const [paramsValidation, modelValidation] = await Promise.all([
        validate([customValidations.string.isMongoId('userId', userId)]),
        validateModel(patchUserValidator, body),
      ]);
      if (!paramsValidation.isValid || !modelValidation.isValid) {
        apiResponse.badRequest('Validation errors', [
          ...paramsValidation.fields,
          ...modelValidation.fields,
        ]);
        return res.response(apiResponse);
      }

      // Step get user profile
      const userProfile = await this.usersRepo.findById(userId);
      if (!userProfile) {
        apiResponse.notFound('User is not found');
        return res.response(apiResponse);
      }

      // Step update profile
      const patch = { ...body, updateDate: Date.now() };
      const updateUser = await this.usersRepo.modify(userId, patch);
      if (!updateUser) {
        apiResponse.unprocessableEntity('User cannot be updated');
        return res.response(apiResponse);
      }
      apiResponse.ok(updateUser);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };
}

module.exports = UsersController;
