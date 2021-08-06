const Model = require('../models/Participant');
// mappers
const mapParticipants = require('../utilities/mappers/participants');
const mapParticipant = require('../utilities/mappers/participant');

class ParticipantsRepository {
  add = async (participant) => {
    const newParticipant = await new Model(participant).save();
    return mapParticipant(newParticipant);
  };

  find = async (filters) => {
    const filter = {};
    const options = {};

    if (filters.username) {
      filter.username = new RegExp(`.*${filters.username}.*`, 'i');
    }

    if (filters.forumId) {
      filter.forumId = filters.forumId;
    }

    if (filters.role) {
      filter.role = filters.role;
    }

    if (filters.page) {
      options.page = filters.page;
    }

    if (filters.pageSize) {
      options.limit = filters.pageSize;
    }

    if (filters.sortBy || filters.sortOrder) {
      options.sort = {
        [filters.sortBy]: filters.sortOrder,
      };
    }

    const participants = await Model.paginate(filter, options);
    return mapParticipants(participants);
  };

  findById = async (id) => {
    const participant = await Model.findById(id);
    return mapParticipant(participant);
  };

  remove = async (id) => {
    const participant = await Model.findByIdAndDelete(id);
    return mapParticipant(participant);
  };

  modify = async (id, patch) => {
    const participant = await Model.findByIdAndUpdate(id, patch, { new: true });
    return mapParticipant(participant);
  };
}

module.exports = ParticipantsRepository;
