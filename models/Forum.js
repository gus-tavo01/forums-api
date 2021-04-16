const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    default: Date.now,
  },
  imageSrc: {
    type: String,
    required: false,
    default: null,
  },
  participants: {
    type: [
      {
        id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        username: { type: String, required: true },
      },
    ],
    default: [],
  },
  topics: {
    type: [
      {
        _id: false,
        id: { type: Schema.Types.ObjectId, unique: true, required: true },
        name: { type: String, required: true },
      },
    ],
    default: [],
  },
  lastActivity: {
    type: Date,
    required: false,
    default: Date.now,
  },
});

ForumSchema.plugin(mongoosePaginate);
const Forum = model('Forum', ForumSchema);

module.exports = Forum;
