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
  updateDate: {
    type: Date,
    required: false,
    default: null,
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
        likes: { type: [Schema.Types.ObjectId], default: [] },
        dislikes: { type: [Schema.Types.ObjectId], default: [] },
      },
    ],
    default: [],
  },
  forumId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

TopicSchema.plugin(mongoosePaginate);
const Topic = model('Topic', TopicSchema);

module.exports = Topic;
