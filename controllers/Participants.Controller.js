const { Router } = require('express');
const useJwtAuth = require('../middlewares/useJwtAuth');
const ApiResponse = require('../common/ApiResponse');
// repos
const ParticipantsRepository = require('../repositories/Participants.Repository');
const ForumsRepository = require('../repositories/Forums.Repository');
const AccountsRepository = require('../repositories/Accounts.Repository');
// validators
const validations = require('../utilities/validations');
const {
  validate,
  executeValidations,
} = require('../common/processors/errorManager');
const postParticipantValidator = require('../utilities/validators/post.participant.validator');
// constants
const Roles = require('../common/constants/roles');

// api/v0/forums/{forumId}/participants
class ParticipantsController {
  constructor() {
    this.router = Router({ mergeParams: true });

    this.forumsRepo = new ForumsRepository();
    this.accountsRepo = new AccountsRepository();
    this.participantsRepo = new ParticipantsRepository();

    this.router.delete('/:id', useJwtAuth, this.delete);
    this.router.post('/', useJwtAuth, this.post);
  }

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const {
        user: requestorUser,
        body,
        params: { forumId },
      } = req;

      // Step validate requestor role is authorized
      const isAuthorized = [Roles.operator, Roles.administrator].some(
        (r) => r === requestorUser.role
      );
      if (!isAuthorized) {
        apiResponse.forbidden(
          'Requestor role does not have sufficient permissions'
        );
        return res.response(apiResponse);
      }

      // Step validate target role
      // when target role is Operator
      // TODO ->
      // validate requester role is Operator
      // replace current Operator role by Administrator

      // Step validate request data
      const [
        { isValid: isModelValid, fields: modelFields },
        { isValid: paramsAreValid, fields: paramsFields },
      ] = await Promise.all([
        validate(body, postParticipantValidator),
        executeValidations([
          validations.isEmpty(forumId, 'forumId'),
          validations.isMongoId(forumId, 'forumId'),
        ]),
      ]);

      if (!isModelValid || !paramsAreValid) {
        apiResponse.badRequest('Validation errors', [
          ...paramsFields,
          ...modelFields,
        ]);
        return res.response(apiResponse);
      }

      // Step get source participant account
      const sourceParticipant = await this.accountsRepo.findByUsername(
        body.username
      );
      if (!sourceParticipant || !sourceParticipant.isActive) {
        apiResponse.unprocessableEntity('Invalid participant');
        return res.response(apiResponse);
      }

      // Step get target forum
      const targetForum = await this.forumsRepo.findById(forumId);
      if (!targetForum || !targetForum.isActive) {
        apiResponse.unprocessableEntity('Invalid forum');
        return res.response(apiResponse);
      }

      // Step create forum participant
      const addedParticipant = await this.participantsRepo.add({
        username: body.username,
        role: body.role,
        forumId,
        userId: sourceParticipant.userId,
        avatar: sourceParticipant.avatar,
      });
      if (!addedParticipant) {
        apiResponse.unprocessableEntity(
          'Cannot add the participant, please try again later'
        );
        res.response(apiResponse);
      }

      // Step update forum participants count
      const newCount = targetForum.participants + 1;
      const forumUpdate = { participants: newCount };
      const updatedForum = await this.forumsRepo.modify(forumId, forumUpdate);
      if (!updatedForum) {
        // Step rollback participant creation
        await this.participantsRepo.remove(addedParticipant.id);
        apiResponse.unprocessableEntity(
          'Cannot update the forum, please try again later'
        );
        return res.response(apiResponse);
      }
      apiResponse.ok(addedParticipant);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  delete = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const {
        user: requestorUser,
        params: { forumId, userId },
      } = req;

      // Step validate requestor role is authorized
      const isAuthorized = [Roles.operator, Roles.administrator].some(
        (r) => r === requestorUser.role
      );
      if (!isAuthorized) {
        apiResponse.forbidden(
          'Requestor role does not have sufficient permissions'
        );
        return res.response(apiResponse);
      }

      // Step validate request data
      const { isValid, fields } = await executeValidations([
        validations.isEmpty(forumId, 'forumId'),
        validations.isMongoId(forumId, 'forumId'),
        validations.isEmpty(userId, 'userId'),
        validations.isMongoId(userId, 'userId'),
      ]);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get source participant account
      const sourceParticipant = await this.accountsRepo.findById(userId);
      if (!sourceParticipant) {
        apiResponse.notFound('Participant not found');
        return res.response(apiResponse);
      }
      if (!sourceParticipant.isActive) {
        apiResponse.unprocessableEntity('Invalid participant');
        return res.response(apiResponse);
      }

      // Step validate target role
      if (sourceParticipant.role === Roles.operator) {
        apiResponse.forbidden('Forum Operator cannot be removed');
        return res.response(apiResponse);
      }

      // Step get target forum
      const targetForum = await this.forumsRepo.findById(forumId);
      if (!targetForum || !targetForum.isActive) {
        apiResponse.unprocessableEntity('Invalid forum');
        return res.response(apiResponse);
      }

      // Step remove forum participant
      const removedParticipant = await this.participantsRepo.remove(userId);
      if (!removedParticipant) {
        apiResponse.unprocessableEntity(
          'Cannot add the participant, please try again later'
        );
        return res.response(apiResponse);
      }

      // Step update forum participants count
      const newCount = targetForum.participants - 1;
      const forumUpdate = { participants: newCount };
      const updatedForum = await this.forumsRepo.modify(forumId, forumUpdate);
      if (!updatedForum) {
        // Step rollback participant creation
        await this.participantsRepo.add({
          username: sourceParticipant.username,
          role: sourceParticipant.role,
          forumId,
          userId: sourceParticipant.userId,
          avatar: sourceParticipant.avatar,
        });
        apiResponse.unprocessableEntity(
          'Cannot update the forum, please try again later'
        );
        return res.response(apiResponse);
      }
      apiResponse.ok(removedParticipant.username);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };
}

module.exports = ParticipantsController;
