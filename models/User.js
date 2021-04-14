const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  createDate: {
    type: Date,
    required: false,
    default: Date.now,
  },
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

UserSchema.plugin(mongoosePaginate);
const User = model('User', UserSchema);

module.exports = User;
