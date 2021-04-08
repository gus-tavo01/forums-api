const { Schema, model } = require('mongoose');

const ForumSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createDate: {
    type: Date,
    required: false,
    default: new Date(),
  },
  imageSrc: {
    type: String,
    required: false,
    default: null,
  },
  // participants: {
  //   type: String, // subDoc
  //   required: false,
  //   default: []
  // },
  lastActivity: {
    type: Date,
    required: false,
    default: new Date(),
  },
});

const Forum = model('Forum', ForumSchema);

module.exports = Forum;
