const { Schema, model } = require('mongoose');

const LoginSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createDate: {
    type: Date,
    required: false,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    required: false,
    default: null,
  },
});

const Login = model('Login', LoginSchema);

module.exports = Login;
