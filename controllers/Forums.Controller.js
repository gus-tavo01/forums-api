const { Router } = require('express');
const useJwtAuth = require('../middlewares/useJwtAuth');
const ApiResponse = require('../common/ApiResponse');
const Roles = require('../common/constants/roles');
// repositories
const ForumsRepository = require('../repositories/Forums.Repository');
const UsersRepository = require('../repositories/Users.Repository');
const ParticipantsRepository = require('../repositories/Participants.Repository');
// validators
const validations = require('../utilities/validations');
const {
  validate,
  executeValidations,
} = require('../common/processors/errorManager');
const postForumValidator = require('../utilities/validators/post.forum.validator');

// api/v0/forums
class ForumsController {
  constructor() {
    this.router = Router();
    this.forumsRepo = new ForumsRepository();
    this.participantsRepo = new ParticipantsRepository();
    this.usersRepo = new UsersRepository();

    this.router.get('/', this.get);
    this.router.post('/', useJwtAuth, this.post);

    // this.router.get('/:id', this.controller.get);
    // this.router.put('/:id', this.put);
    // this.router.delete('/:id', this.delete);
  }

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const defaultFilters = {
        isActive: true,
        page: 1,
        pageSize: 15,
        sortBy: 'lastActivity',
        sortOrder: 'desc',
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
        public: true,
      };

      // Step validate query params
      const { isValid, fields } = await executeValidations([
        validations.isBool(filters.isActive, 'isActive'),
        validations.isNumeric(filters.page, 'page'),
        validations.isNumeric(filters.pageSize, 'pageSize'),
        // TODO -> enable this validations when they are implemented
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

      // Step get forums
      const response = await this.forumsRepo.find(filters);
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { user } = req;
      const { topic, description, isPrivate } = req.body;

      // Step invoke model validator
      const { isValid, fields } = await validate(req.body, postForumValidator);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get requestor
      const requestor = await this.usersRepo.findByUsername(user.username);
      if (!requestor) {
        apiResponse.unprocessableEntity('User profile cannot be retrieved');
        return res.response(apiResponse);
      }

      // Step create forum
      const createdForum = await this.forumsRepo.add({
        topic,
        description,
        author: user.username,
        isPrivate,
        participants: 1,
      });
      if (!createdForum) {
        apiResponse.unprocessableEntity(
          'Forum cannot be created, try again later'
        );
        return res.response(apiResponse);
      }

      // Step add owner as forum Operator
      const participant = await this.participantsRepo.add({
        username: user.username,
        role: Roles.operator,
        forumId: createdForum.id,
        userId: requestor.id,
        avatar: user.avatar,
      });
      if (!participant) {
        apiResponse.unprocessableEntity('Cannot add participant on forum');
        // Step rollback forum creation
        await this.forumsRepo.remove(createdForum.id);
        return res.response(apiResponse);
      }
      apiResponse.created(createdForum);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }

    return res.response(apiResponse);
  };

  // update

  // delete
}

module.exports = ForumsController;
