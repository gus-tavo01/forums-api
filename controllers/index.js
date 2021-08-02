const { Router } = require('express');
const AuthController = require('./Auth.Controller');
const ForumsController = require('./Forums.Controller');
const UsersController = require('./Users.Controller');
const TopicsController = require('./Topics.Controller');
const CommentsController = require('./Comments.controller');
// middlewares
const useResponse = require('../middlewares/useResponse');

const router = Router();
const api = 'api/v0';

const authController = new AuthController();
const forumsController = new ForumsController();
const usersController = new UsersController();
const topicsController = new TopicsController();
const commentsController = new CommentsController();

router.use(useResponse);
router.use(`/${api}/auth`, authController.router);
router.use(`/${api}/forums`, forumsController.router);
router.use(`/${api}/users`, usersController.router);
router.use(`/${api}/forums/:forumId/topics`, topicsController.router);
router.use(
  `/${api}/forums/:forumId/topics/:topicId/comments`,
  commentsController.router
);

module.exports = router;
