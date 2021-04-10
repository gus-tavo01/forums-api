const { Router } = require('express');

// api/v0/users
class UsersController {
  constructor() {
    this.router = Router();

    this.router.get('/', this.get);
  }

  get = async (req, res) => {
    res.status(200).json({ result: 'Okay' });
  };
}
