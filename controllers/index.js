const { Router } = require('express');
const AuthController = require('./Auth.Controller');
const ForumsController = require('./Forums.Controller');
const UsersController = require('./Users.Controller');
const TopicsController = require('./Topics.Controller');

const router = Router();
const api = 'api/v0';

const authController = new AuthController();
const forumsController = new ForumsController();
const usersController = new UsersController();
const topicsController = new TopicsController();

router.use(`/${api}/auth`, authController.router);
router.use(`/${api}/forums`, forumsController.router);
router.use(`/${api}/users`, usersController.router);
router.use(`/${api}/forums/:forumId/topics`, topicsController.router);

module.exports = router;
