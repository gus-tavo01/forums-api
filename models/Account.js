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
  userId: {
    type: Schema.Types.ObjectId,
    isRequired: false,
    default: null,
  },
});

const Account = model('Account', AccountSchema);

module.exports = Account;
