const { Router } = require('express');
const AuthController = require('./Auth.Controller');
const ForumsController = require('./Forums.Controller');
const UsersController = require('./Users.Controller');
const ParticipantsController = require('./Participants.Controller');
const CommentsController = require('./Comments.controller');
// middlewares
const useResponse = require('../middlewares/useResponse');

const router = Router();
const api = '/api/v0';

const authController = new AuthController();
const forumsController = new ForumsController();
const usersController = new UsersController();
const participantsController = new ParticipantsController();
const commentsController = new CommentsController();

router.use(useResponse);

router.use(`${api}/auth`, authController.router);
router.use(`${api}/forums`, forumsController.router);
router.use(`${api}/users`, usersController.router);
router.use(
  `${api}/forums/:forumId/participants`,
  participantsController.router
);
router.use(`/${api}/forums/:forumId/comments`, commentsController.router);

module.exports = router;
