const { Router } = require('express');

// api/v0/forums
const forumsRouter = (controller) => {
  const router = Router();

  router.get('/', controller.get);
  router.post('/', controller.post);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.put);
  router.delete('/:id', controller.delete);

  return router;
}

module.exports = forumsRouter;