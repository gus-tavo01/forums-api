const { Router } = require('express');

// api/v0/auth
class AuthController {
  constructor() {
    this.router = Router();
    this.router.post('/login', this.login);
  }

  login = async (req, res) => {
    return res.status(200).json({ message: 'true message' });
  };

  // password reset?
}

module.exports = AuthController;
