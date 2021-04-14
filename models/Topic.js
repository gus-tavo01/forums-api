const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const TopicSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
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
    default: Date.now,
  },
  comments: {
    type: [
      {
        from: { type: String, required: true },
        to: { type: String, required: false, default: null },
        message: { type: String, required: true },
        createDate: {
          type: Date,
          required: false,
          default: Date.now,
        },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
      },
    ],
    default: [],
  },
});

TopicSchema.plugin(mongoosePaginate);
const Topic = model('Topic', TopicSchema);

module.exports = Topic;
