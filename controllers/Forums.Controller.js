const { Router } = require('express');
const useJwtAuth = require('../middlewares/useJwtAuth');
const ApiResponse = require('../common/ApiResponse');

const ForumsRepository = require('../repositories/Forums.Repository');
const UsersRepository = require('../repositories/Users.Repository');
const ParticipantsRepository = require('../repositories/Participants.Repository');

const CloudinaryService = require('../services/Cloudinary.Service');

const Roles = require('../common/constants/roles');
const CloudinaryFolders = require('../common/constants/cloudinaryFolders');

const { validate, validateModel, validations } = require('js-validation-tool');
const postForumValidator = require('../utilities/validators/post.forum.validator');

// api/v0/forums
class ForumsController {
  constructor() {
    this.router = Router();
    this.forumsRepo = new ForumsRepository();
    this.participantsRepo = new ParticipantsRepository();
    this.usersRepo = new UsersRepository();

    this.cloudinaryService = new CloudinaryService();

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
      const { isValid, fields } = await validate([
        validations.boolean.isBool('isActive', filters.isActive),
        validations.number.isNumeric('page', filters.page),
        validations.number.isNumeric('pageSize', filters.pageSize),
        validations.common.isOptional('author', filters.author),
        validations.string.isNotEmpty('author', filters.author),
        validations.common.isOptional('topic', filters.topic),
        validations.string.isNotEmpty('topic', filters.topic),
        validations.common.isOneOf('sortBy', filters.sortBy, [
          'lastActivity',
          'topic',
        ]),
        validations.common.isOneOf('sortOrder', filters.sortOrder, [
          'asc',
          'desc',
        ]),
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
      const { topic, description, isPrivate, image } = req.body;

      // Step invoke model validator
      const { isValid, fields } = await validateModel(
        postForumValidator,
        req.body
      );
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

      // rollback processes
      const rollback = [];

      // Step upload forum image on cloud
      let imageId = null;
      if (image) {
        const uploadedImageId = await this.cloudinaryService.uploadImage(
          image,
          CloudinaryFolders.forums
        );
        if (!uploadedImageId) {
          apiResponse.unprocessableEntity(
            'Cannot upload the forum image, please try later'
          );
          return res.response(apiResponse);
        }
        imageId = uploadedImageId;
      }

      // Step create forum
      const createdForum = await this.forumsRepo.add({
        topic,
        description,
        author: user.username,
        isPrivate,
        participants: 1,
        image: imageId,
      });
      if (!createdForum) {
        rollback.push(this.cloudinaryService.deleteImage(imageId));
        await Promise.all(rollback);

        apiResponse.unprocessableEntity('Forum cannot be created');
        return res.response(apiResponse);
      }

      // Step add forum owner as forum Operator
      const participant = await this.participantsRepo.add({
        username: user.username,
        role: Roles.operator,
        forumId: createdForum.id,
        userId: requestor.id,
        avatar: user.avatar,
      });
      if (!participant) {
        rollback.push(this.forumsRepo.remove(createdForum.id));
        await Promise.all(rollback);

        apiResponse.unprocessableEntity('Cannot add participant on forum');
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
