const Participant = require('../models/Participant');
const RepositoryBase = require('./Base.Repository');
const mapParticipants = require('../utilities/mappers/participants');
const mapParticipant = require('../utilities/mappers/participant');

class ParticipantsRepository extends RepositoryBase {
  constructor() {
    super(Participant, mapParticipant);
  }

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

    const participants = await Participant.paginate(filter, options);
    return mapParticipants(participants);
  };

  findByUserAndForum = async (userId, forumId) => {
    const participant = await this.model.findOne({ userId, forumId });
    return mapParticipant(participant);
  };
}

module.exports = ParticipantsRepository;
