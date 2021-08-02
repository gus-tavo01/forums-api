const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');
const ForumsService = require('../services/Forums.Service');
const TopicsService = require('../services/Topics.Service');
const CommentsService = require('../services/Comments.Service');
const useJwtAuth = require('../middlewares/useJwtAuth');

class CommentsController {
  constructor() {
    this.router = Router({ mergeParams: true });
    this.forumsService = new ForumsService();
    this.topicsService = new TopicsService();
    this.commentsService = new CommentsService();

    this.router.get('/', this.get);
    // this.router.get('/private', useJwtAuth, this.getPrivateComments);
    this.router.post('/', useJwtAuth, this.post);
    // this.router.delete('/:id', useJwtAuth, this.delete);
  }

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { topicId, forumId } = req.params;
      const defaultFilters = {
        page: 1,
        pageSize: 15,
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
        topicId,
      };

      // Step Get forum and verify is public
      const getForum = await this.forumsService.getById(forumId);
      // handle getForum errors
      const {
        result: { isPrivate },
      } = getForum;

      if (isPrivate) {
        apiResponse.forbidden('You are not allowed to see this forum content');
        return res.response(apiResponse);
      }

      // Step get topic
      const getTopic = await this.topicsService.getById(topicId);
      if (getTopic.fields.length) {
        apiResponse.badRequest(null, getTopic.fields);
        return res.response(apiResponse);
      }
      const topic = getTopic.result;

      if (forumId !== topic.forumId.toString()) {
        apiResponse.badRequest('Topic does not match with provided Forum');
        return res.response(apiResponse);
      }

      // Step get topic comments
      const getComments = await this.commentsService.get(filters);
      apiResponse.ok(getComments.result);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.response(apiResponse);
  };

  // getPrivateComments = async (req, res) => {
  // TODO -> validate requester has access to this forum
  // };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { topicId } = req.params;
      const { body, user } = req;
      // TODO
      // Step request validations

      // Step get topic
      const getTopicResponse = await this.topicsService.getById(topicId);
      if (getTopicResponse.fields.length) {
        apiResponse.badRequest('Invalid topic data', getTopicResponse.fields);
        return res.response(apiResponse);
      }
      if (!getTopicResponse.result) {
        apiResponse.unprocessableEntity('Topic does not exist');
        return res.response(apiResponse);
      }
      const topic = getTopicResponse.result;

      // TODO
      // Step verify requester is a participant

      // Step create comment
      const newComment = { ...body, topicId: topic.id, from: user.username };
      const createCommentResponse = await this.commentsService.create(
        newComment
      );
      if (createCommentResponse.fields.length) {
        apiResponse.badRequest(null, createCommentResponse.fields);
        return res.response(apiResponse);
      }
      if (!createCommentResponse.result) {
        apiResponse.unprocessableEntity(
          'Comment cannot be processed, please try again later'
        );
        return res.response(apiResponse);
      }

      // Step update topic comments count
      const patch = {
        comments: parseInt(topic.comments) + 1,
      };
      const updateTopic = await this.topicsService.update(topic.id, patch);
      if (!updateTopic.result) {
        apiResponse.internalServerError(
          'Error while updating topic comments count'
        );
        return res.response(apiResponse);
      }
      apiResponse.created(createCommentResponse.result);
    } catch (error) {
      apiResponse.internalServerError(error.message);
      console.log(error);
    }
    return res.response(apiResponse);
  };
}

module.exports = CommentsController;
