const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');
const useAuth = require('../middlewares/useJwtAuth');

const UsersRepository = require('../repositories/Users.Repository');
const ForumsRepository = require('../repositories/Forums.Repository');

const validations = require('../utilities/validations');
const { executeValidations } = require('../common/processors/errorManager');

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
      const { isValid, fields } = await executeValidations([
        validations.isNumeric(filters.page, 'page'),
        validations.isNumeric(filters.pageSize, 'pageSize'),
        // validations.isOptional(filters.username, 'username'),
        // validations.isOptional(filters.email, 'email'),
        // validations.isOptional(filters.language, 'language'),
        // validations.isOptional(filters.isActive, 'isActive'),
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
      const { isValid, fields } = await executeValidations([
        validations.isMongoId(id, 'id'),
      ]);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get user
      const user = await this.usersRepo.findById(id);
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
      const { isValid, fields } = await executeValidations([
        validations.isNumeric(filters.page, 'page'),
        validations.isNumeric(filters.pageSize, 'pageSize'),
        // TODO -> enable this validations when they are implemented
        // validations.isOptional(filters.public, 'public'),
        // validations.isBool(filters.public, 'public'),
        // validations.isOptional(filters.isActive, 'isActive'),
        // validations.isBool(filters.isActive, 'isActive'),
        // validations.isOptional(filters.author, 'author'),
        // validations.isEmpty(filters.author, 'author'),
        // validations.isOptional(filters.topic, 'topic'),
        // validations.isEmpty(filters.topic, 'topic'),
        // validations.isOneOf(filters.sortBy, ['lastActivity', 'topic']),
        // validations.isOneOf(filters.sortOrder, ['asc', 'desc']),
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
  // patch
}

module.exports = UsersController;
