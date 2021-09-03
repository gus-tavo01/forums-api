const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');

const CommentsRepository = require('../repositories/Comments.Repository');
const ForumsRepository = require('../repositories/Forums.Repository');
const ParticipantsRepository = require('../repositories/Participants.Repository');
const UsersRepository = require('../repositories/Users.Repository');

const useJwtAuth = require('../middlewares/useJwtAuth');

const Roles = require('../common/constants/roles');

class CommentsController {
  constructor() {
    this.router = Router({ mergeParams: true });
    this.forumsRepo = new ForumsRepository();
    this.commentsRepo = new CommentsRepository();
    this.participantsRepo = new ParticipantsRepository();
    this.usersRepo = new UsersRepository();

    this.router.get('/', this.get);
    this.router.post('/', useJwtAuth, this.post);
    // this.router.delete('/:id', useJwtAuth, this.delete);
  }

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { forumId } = req.params;
      const defaultFilters = {
        page: 1,
        pageSize: 15,
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
        forumId,
      };

      // Step Get forum and verify is public
      const forum = await this.forumsRepo.findById(forumId);
      if (!forum) {
        apiResponse.badRequest('Invalid forum, not found');
        return res.response(apiResponse);
      }

      if (forum.isPrivate) {
        apiResponse.forbidden('You are not allowed to see this forum content');
        return res.response(apiResponse);
      }

      // Step get forum comments
      const comments = await this.commentsRepo.find(filters);
      apiResponse.ok(comments);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.response(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { forumId } = req.params;
      const { body, user } = req;

      // TODO
      // Step request validations
      // model validator

      // Step get forum
      const forum = await this.forumsRepo.findById(forumId);
      if (!forum) {
        apiResponse.unprocessableEntity('Invalid forum, does not exist');
        return res.response(apiResponse);
      }

      // Step verify requester is a forum participant
      const { id: userId } = await this.usersRepo.findByUsername(user.username);

      const forumParticipant = await this.participantsRepo.findByUserAndForum(
        userId,
        forumId
      );
      if (!forumParticipant) {
        apiResponse.forbidden(
          'You cannot post on this forum, since you are not a participant'
        );
        return res.response(apiResponse);
      }
      if (forumParticipant.role === Roles.viewer) {
        apiResponse.forbidden(
          'Your role does not have permissions to post a commment'
        );
        return res.response(apiResponse);
      }

      // Step create comment
      const createdComment = await this.commentsRepo.add({
        message: body.message,
        forumId: forum.id,
        from: user.username,
        to: body.to,
      });
      if (!createdComment) {
        apiResponse.unprocessableEntity(
          'Comment cannot be processed, please try again later'
        );
        return res.response(apiResponse);
      }

      // Step update forum comments count
      const updatedForum = await this.forumsRepo.modify(forum.id, {
        comments: parseInt(forum.comments) + 1,
      });
      if (!updatedForum) {
        apiResponse.unprocessableEntity(
          'Error while updating topic comments count'
        );
        return res.response(apiResponse);
      }
      apiResponse.created(createdComment);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };
}

module.exports = CommentsController;
