const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  selfDescription: { type: String, required: false },
  createDate: {
    type: Date,
    required: false,
    default: Date.now,
  },
  updateDate: { type: Date, required: false, default: null },
});

UserSchema.plugin(mongoosePaginate);
const User = model('User', UserSchema);

module.exports = User;
