const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ParticipantSchema = new Schema({
  username: { type: String, required: true },
  avatar: { type: String, required: false, default: null },
  lastActivity: { type: Date, isRequired: false, default: Date.now },
  forumId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  role: { type: String, required: true },
});

ParticipantSchema.plugin(mongoosePaginate);
const Participant = model('Participant', ParticipantSchema);

module.exports = Participant;
