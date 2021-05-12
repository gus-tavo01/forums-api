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
  forumId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

TopicSchema.plugin(mongoosePaginate);
const Topic = model('Topic', TopicSchema);

module.exports = Topic;
