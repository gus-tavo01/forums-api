const { Schema, model } = require('mongoose');

const AccountSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    isRequired: false,
    default: null,
  },
  isActive: {
    type: Boolean,
    required: false,
    default: true,
  },
  createDate: {
    type: Date,
    required: false,
    default: Date.now,
  },
  updateDate: {
    type: Date,
    required: false,
    default: null,
  },
  // recovery: {
  //   attempts: {
  //     type: Number,
  //     required: false,
  //     default: 0,
  //   },
  //   secretCode: {
  //     type: String,
  //     required: false,
  //     default: null,
  //   },
  // },
  // preferences: { language: { type: String, isRequired: true }, appTheme: { } }
});

const Account = model('Account', AccountSchema);

module.exports = Account;
