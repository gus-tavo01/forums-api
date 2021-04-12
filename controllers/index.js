const { Router } = require('express');
const AuthController = require('./Auth.Controller');
const ForumsController = require('./Forums.Controller');
const UsersController = require('./Users.Controller');

const router = Router();
const api = 'api/v0';

const authController = new AuthController();
const forumsController = new ForumsController();
const usersController = new UsersController();

router.use(`/${api}/auth`, authController.router);
router.use(`/${api}/forums`, forumsController.router);
router.use(`/${api}/users`, usersController.router);

// endpoints
// GET api/v0/forums?...filters
// GET api/v0/forums/{id}/participants
// GET api/v0/forums/{id}/topics
// GET api/v0/forums/{id}/topics/{id}/comments
// GET api/v0/users/{id}

module.exports = router;
