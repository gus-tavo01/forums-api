const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  createDate: {
    type: Date,
    required: false,
    default: Date.now,
  },
  // TBD
  // preferences: {
  //   theme: {
  //     type: String,
  //   },
  //   language: {
  //     type: Schema.Types.ObjectId,
  //     ref: 'Language',
  //   },
  // },
});

const User = model('User', UserSchema);

module.exports = User;
