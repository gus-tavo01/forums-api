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
    this.router.get('/:id/forums', useAuth, this.getPrivateForums);
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

  getPrivateForums = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { user } = req;
      const { id } = req.params;
      const defaultFilters = {
        page: 1,
        pageSize: 15,
        sortOrder: 'desc',
        sortBy: 'createDate',
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
        author: user.username,
      };

      // Step validate filters
      // TODO

      // Step verify resource user id exist
      const foundUser = await this.usersRepo.findById(id);
      if (!foundUser) {
        apiResponse.unprocessableEntity('User resource is not found');
        return res.response(apiResponse);
      }

      // Step validate auth user is is eq to resource id
      if (user.username !== foundUser.username) {
        apiResponse.forbidden('Cannot view other users forums');
        return res.response(apiResponse);
      }

      // Step get user own forums
      const forumsResponse = await this.forumsRepo.find(filters);
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
