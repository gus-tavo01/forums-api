const { Router } = require('express');
const ApiResponse = require('../common/ApiResponse');
const useJwtAuth = require('../middlewares/useJwtAuth');
const TopicsService = require('../services/Topics.Service');
const ForumsService = require('../services/Forums.Service');

class TopicsController {
  constructor() {
    this.router = Router({ mergeParams: true });
    this.topicsService = new TopicsService();
    this.forumsService = new ForumsService();

    this.router.get('/', this.get);
    this.router.post('/', useJwtAuth, this.post);
    this.router.get('/:id', this.getById);
    this.router.delete('/:id', useJwtAuth, this.delete);
  }

  getById = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { id } = req.params;
      const response = await this.topicsService.getById(id);
      if (!response.result) {
        apiResponse.notFound('Topic is not found');
        return res.response(apiResponse);
      }
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
      // console.log(error);
    }
    return res.response(apiResponse);
  };

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { forumId } = req.params;
      const { body } = req;
      // Step get forum
      const getForumResponse = await this.forumsService.getById(forumId);
      if (getForumResponse.fields.length) {
        apiResponse.badRequest('Invalid forum', getForumResponse.fields);
        return res.response(apiResponse);
      }
      if (!getForumResponse.result) {
        apiResponse.unprocessableEntity('Forum does not exist');
        return res.response(apiResponse);
      }
      const forum = getForumResponse.result;

      // Step create topic
      const newTopic = { ...body, forumId: forum.id };
      const createTopicResponse = await this.topicsService.create(newTopic);
      if (createTopicResponse.fields.length) {
        apiResponse.badRequest(
          'Invalid topic data',
          createTopicResponse.fields
        );
        return res.response(apiResponse);
      }
      if (!createTopicResponse.result) {
        apiResponse.unprocessableEntity(
          'Topic cannot be created, please try again later'
        );
        return res.response(apiResponse);
      }
      // Step add topic in forum
      const createdTopic = createTopicResponse.result;
      const forumTopic = {
        topicId: createdTopic.id,
        name: createdTopic.name,
      };
      const forumUpdate = { topics: [...forum.topics, forumTopic] };
      const updateForumResponse = await this.forumsService.update(
        forumId,
        forumUpdate
      );
      if (updateForumResponse.fields.length) {
        apiResponse.unprocessableEntity('Cannot add topic in forum');
        return res.response(apiResponse);
      }
      apiResponse.ok(createTopicResponse);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { forumId } = req.params;
      const filters = { ...req.query, forumId };
      const response = await this.topicsService.get(filters);
      apiResponse.ok(response);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.response(apiResponse);
  };

  delete = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { user } = req;
      const { id, forumId } = req.params;

      // Step get topic
      const getTopicResponse = await this.topicsService.getById(id);
      if (getTopicResponse.fields.length) {
        apiResponse.badRequest('Please check for errors');
        return res.response(apiResponse);
      }
      if (!getTopicResponse.result) {
        apiResponse.notFound('Topic not found');
        return res.response(apiResponse);
      }

      // Step get forum
      const getForumResponse = await this.forumsService.getById(forumId);
      if (getForumResponse.fields.length) {
        apiResponse.unprocessableEntity('Invalid forumId');
        return res.response(apiResponse);
      }
      if (!getForumResponse.result) {
        apiResponse.unprocessableEntity('Forum is not found');
        return res.response(apiResponse);
      }
      const forum = getForumResponse.result;

      // Step validate user can delete topics
      if (forum.author !== user.username) {
        apiResponse.forbidden('Only forum authors can delete topics');
        return res.response(apiResponse);
      }

      // Step delete topic
      const deleteTopicResponse = await this.topicsService.remove(id);
      if (deleteTopicResponse.fields.length) {
        apiResponse.unprocessableEntity('Cannot be processed, try again later');
        return res.response(apiResponse);
      }
      if (!deleteTopicResponse.result) {
        apiResponse.unprocessableEntity(
          'Cannot be processed, please try again later'
        );
        return res.response(apiResponse);
      }

      // Step remove topic from forum
      const topics = forum.topics.filter(
        (topic) => topic.topicId.toString() !== id
      );
      const forumUpdate = { topics };
      const updateForumResponse = await this.forumsService.update(
        forumId,
        forumUpdate
      );
      if (updateForumResponse.fields.length || !updateForumResponse.result) {
        apiResponse.unprocessableEntity('Topic cannot be removed from forum');
        return res.response(apiResponse);
      }
      apiResponse.ok(deleteTopicResponse);
    } catch (error) {
      apiResponse.internalServerError(error);
    }
    return res.response(apiResponse);
  };

  // TODO
  // update name on forums collection if proceed
  // patch
}

module.exports = TopicsController;
