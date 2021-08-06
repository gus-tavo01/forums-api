const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ForumSchema = new Schema({
  topic: {
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
    default: Date.now,
  },
  updateDate: { type: Date, required: false, default: Date.now },
  imageSrc: {
    type: String,
    required: false,
    default: null,
  },
  participants: { type: Number, required: false, default: 0 },
  lastActivity: {
    type: Date,
    required: false,
    default: Date.now,
  },
  isPrivate: {
    type: Boolean,
    required: false,
    default: false,
  },
  isActive: { type: Boolean, required: false, default: true },
});

ForumSchema.plugin(mongoosePaginate);
const Forum = model('Forum', ForumSchema);

module.exports = Forum;
