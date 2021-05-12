const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CommentSchema = new Schema({
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
});

CommentSchema.plugin(mongoosePaginate);
const Comment = model('Comment', CommentSchema);

module.exports = Comment;
