const { Router } = require('express');
const useJwtAuth = require('../middlewares/useJwtAuth');
const ApiResponse = require('../common/ApiResponse');

const ParticipantsRepository = require('../repositories/Participants.Repository');
const ForumsRepository = require('../repositories/Forums.Repository');
const AccountsRepository = require('../repositories/Accounts.Repository');
const UsersRepository = require('../repositories/Users.Repository');

// deprecate these
const validations = require('../utilities/validations');
const {
  validate,
  executeValidations,
} = require('../common/processors/errorManager');
// end deprecations

const customValidations = validations;
const jsValidator = require('js-validation-tool');
const postParticipantValidator = require('../utilities/validators/participants/post.validator');
const patchParticipantValidator = require('../utilities/validators/participants/patch.validator');

const Roles = require('../common/constants/roles');

// api/v0/forums/{forumId}/participants
class ParticipantsController {
  constructor() {
    this.router = Router({ mergeParams: true });

    this.forumsRepo = new ForumsRepository();
    this.accountsRepo = new AccountsRepository();
    this.usersRepo = new UsersRepository();
    this.participantsRepo = new ParticipantsRepository();

    this.router.delete('/:userId', useJwtAuth, this.delete);
    this.router.post('/', useJwtAuth, this.post);
    this.router.get('/', useJwtAuth, this.get);
    this.router.patch('/:participantId', useJwtAuth, this.patch);
  }

  post = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const {
        user: { username: requestorUsername },
        body,
        params: { forumId },
      } = req;

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

      // Step get requestor user
      const requestorUser = await this.usersRepo.findByUsername(
        requestorUsername
      );
      if (!requestorUser) {
        apiResponse.unprocessableEntity('Invalid request');
        return res.response(apiResponse);
      }

      // Step get requestor role
      const requestorParticipant = await this.participantsRepo.findByUserAndForum(
        requestorUser.id,
        forumId
      );
      if (!requestorParticipant) {
        apiResponse.forbidden(
          `${requestorUsername} is not a member of this forum`
        );
        return res.response(apiResponse);
      }

      // Step validate requestor role is authorized
      const isAuthorized = [Roles.Operator, Roles.Administrator].some(
        (r) => r === requestorParticipant.role
      );
      if (!isAuthorized) {
        apiResponse.forbidden(
          `${requestorUsername} does not have the required role permissions`
        );
        return res.response(apiResponse);
      }

      // Step validate target role
      const forumRoles = Object.keys(Roles).map((k) => Roles[k]);
      const targetRoleExist = forumRoles.some((r) => r === body.role);
      if (!targetRoleExist) {
        apiResponse.unprocessableEntity(
          `Forum participant role: '${body.role}' is incorrect`
        );
        return res.response(apiResponse);
      }

      // Step verify an operator can be transfered
      if (
        body.role === Roles.Operator &&
        requestorParticipant.role !== Roles.Operator
      ) {
        apiResponse.forbidden(
          `${requestorUsername} is not the current forum operator`
        );
        return res.response(apiResponse);
      }

      // Step get source participant account
      const sourceUserAccount = await this.accountsRepo.findByUsername(
        body.username
      );
      if (!sourceUserAccount || !sourceUserAccount.isActive) {
        apiResponse.unprocessableEntity('Invalid participant');
        return res.response(apiResponse);
      }

      // Step get user profile
      const sourceProfile = await this.usersRepo.findByUsername(body.username);
      if (!sourceProfile) {
        apiResponse.unprocessableEntity('Invalid participant');
        return res.response(apiResponse);
      }

      // Step validate source participant is not a member already
      const sourceParticipant = await this.participantsRepo.findByUserAndForum(
        sourceProfile.id,
        forumId
      );
      if (sourceParticipant) {
        apiResponse.conflict(
          `${body.username} is a member of this forum already`
        );
        return res.response(apiResponse);
      }

      // Step get target forum
      const targetForum = await this.forumsRepo.findById(forumId);
      if (
        !targetForum ||
        (!targetForum.isActive && body.role !== Roles.Operator)
      ) {
        apiResponse.unprocessableEntity('Invalid forum');
        return res.response(apiResponse);
      }

      // Step replace current operator by the provided one
      if (body.role === Roles.Operator) {
        const updateRequestor = await this.participantsRepo.modify(
          requestorParticipant.id,
          {
            role: Roles.Administrator,
          }
        );
        if (!updateRequestor) {
          apiResponse.unprocessableEntity('Cannot modify current operator');
          return res.response(apiResponse);
        }
      }

      // Step create forum participant
      const addedParticipant = await this.participantsRepo.add({
        username: body.username,
        role: body.role,
        forumId,
        userId: sourceProfile.id,
        avatar: sourceProfile.avatar,
      });
      if (!addedParticipant) {
        apiResponse.unprocessableEntity(
          'Cannot add the participant, please try again later'
        );
        if (body.role === Roles.Operator) {
          // Step rollback update current Operator
          await this.participantsRepo.modify(requestorParticipant.id, {
            role: Roles.Operator,
          });
        }
        res.response(apiResponse);
      }

      // Step update forum participants count
      const newCount = targetForum.participants + 1;
      const forumUpdate = { participants: newCount };
      const updatedForum = await this.forumsRepo.modify(forumId, forumUpdate);
      if (!updatedForum) {
        apiResponse.unprocessableEntity(
          'Cannot update the forum, please try again later'
        );
        // Step rollback participant creation
        await this.participantsRepo.remove(addedParticipant.id);
        if (body.role === Roles.Operator) {
          // Step rollback current Operator update
          await this.participantsRepo.modify(requestorParticipant.id, {
            role: Roles.Operator,
          });
        }
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
        user: { username: requestorUsername },
        params: { forumId, userId: participantId },
      } = req;

      // Step validate request data
      const { isValid, fields } = await executeValidations([
        validations.isEmpty(forumId, 'forumId'),
        validations.isMongoId(forumId, 'forumId'),
        validations.isEmpty(participantId, 'participantId'),
        validations.isMongoId(participantId, 'participantId'),
      ]);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get requestor user
      const requestor = await this.usersRepo.findByUsername(requestorUsername);
      if (!requestor) {
        apiResponse.unprocessableEntity('Cannot get user profile');
        return res.response(apiResponse);
      }

      // Step get requestor role
      const requestorParticipant = await this.participantsRepo.findByUserAndForum(
        requestor.id,
        forumId
      );
      if (!requestorParticipant) {
        apiResponse.forbidden('Requestor is not a member of this forum');
        return res.response(apiResponse);
      }

      // Step get target participant
      const sourceParticipant = await this.participantsRepo.findById(
        participantId
      );
      if (!sourceParticipant) {
        apiResponse.notFound(`${participantId} is not member of this forum`);
        return res.response(apiResponse);
      }

      // Step validate requestor is authorized to perform the request
      const isSelfRequest = sourceParticipant.username === requestorUsername;
      const isAuthorized = [Roles.Operator, Roles.Administrator].some(
        (r) => r === requestorParticipant.role
      );
      if (!isAuthorized && !isSelfRequest) {
        apiResponse.forbidden(
          'Requestor role does not have sufficient permissions'
        );
        return res.response(apiResponse);
      }

      // Step validate target role
      if (sourceParticipant.role === Roles.Operator) {
        apiResponse.forbidden('Forum Operator cannot be removed');
        return res.response(apiResponse);
      }

      // Step get source account
      const sourceUserAccount = await this.accountsRepo.findByUsername(
        sourceParticipant.username
      );
      if (!sourceUserAccount || !sourceUserAccount.isActive) {
        apiResponse.unprocessableEntity('Invalid participant');
        return res.response(apiResponse);
      }

      // Step get target forum
      const targetForum = await this.forumsRepo.findById(forumId);
      if (!targetForum) {
        apiResponse.unprocessableEntity('Invalid forum');
        return res.response(apiResponse);
      }

      // Step remove forum participant
      const removedParticipant = await this.participantsRepo.remove(
        sourceParticipant.id
      );
      if (!removedParticipant) {
        apiResponse.unprocessableEntity(
          'Cannot remove the participant, please try again later'
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

  get = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const { forumId } = req.params;
      const requestor = req.user;

      const defaultFilters = {
        page: 1,
        pageSize: 15,
      };
      const filters = {
        ...defaultFilters,
        ...req.query,
        forumId,
      };

      // Step validations
      const { isValid, fields } = await executeValidations([
        validations.isNumeric(filters.page, 'page'),
        validations.isNumeric(filters.pageSize, 'pageSize'),
      ]);
      if (!isValid) {
        apiResponse.badRequest('Validation errors', fields);
        return res.response(apiResponse);
      }

      // Step get requestor user and forum
      const [requestorUser, forum] = await Promise.all([
        this.usersRepo.findByUsername(requestor.username),
        this.forumsRepo.findById(forumId),
      ]);
      if (!requestorUser) {
        apiResponse.unprocessableEntity('Invalid account');
        return res.response(apiResponse);
      }
      if (!forum) {
        apiResponse.unprocessableEntity('Forum not found');
        return res.response(apiResponse);
      }

      // Step verify requestor has permissions
      const requestorParticipant = await this.participantsRepo.findByUserAndForum(
        requestorUser.id,
        forumId
      );
      if (forum.isPrivate && !requestorParticipant) {
        apiResponse.forbidden(
          `User: ${requestor.username} does not have sufficient permissions`
        );
        return res.response(apiResponse);
      }

      // Step get participants
      const participants = await this.participantsRepo.find(filters);
      apiResponse.ok(participants);
    } catch (error) {
      apiResponse.internalServerError(error.message);
    }
    return res.response(apiResponse);
  };

  patch = async (req, res) => {
    const apiResponse = new ApiResponse();
    try {
      const {
        user: { username: requestorUsername },
        params: { forumId, participantId },
        body,
      } = req;

      // Step validate request data
      const [paramsValidation, modelValidation] = await Promise.all([
        jsValidator.validate([
          customValidations.string.isMongoId('forumId', forumId),
          customValidations.string.isMongoId('participantId', participantId),
        ]),
        jsValidator.validateModel(patchParticipantValidator, body),
      ]);
      if (!paramsValidation.isValid || !modelValidation.isValid) {
        apiResponse.badRequest('Validation errors', [
          ...paramsValidation.fields,
          ...modelValidation.fields,
        ]);
        return res.response(apiResponse);
      }

      // Step verify role is valid
      const roleValidation = await jsValidator.validate([
        jsValidator.validations.common.isOptional('role', body.role),
        customValidations.common.isOneOf('role', body.role, Object.keys(Roles)),
      ]);
      if (!roleValidation.isValid) {
        apiResponse.unprocessableEntity('Invalid role', roleValidation.fields);
        return res.response(apiResponse);
      }

      // Step get target participant
      const targetParticipant = await this.participantsRepo.findById(
        participantId
      );
      if (!targetParticipant) {
        apiResponse.notFound(`${participantId} is not member of this forum`);
        return res.response(apiResponse);
      }

      // Step get target forum
      const targetForum = await this.forumsRepo.findById(forumId);
      if (!targetForum) {
        apiResponse.unprocessableEntity('Invalid forum');
        return res.response(apiResponse);
      }

      // #region validate user permissions
      // Step get requestor user profile
      const requestorProfile = await this.usersRepo.findByUsername(
        requestorUsername
      );
      if (!requestorProfile) {
        apiResponse.unprocessableEntity('Cannot get requestor profile');
        return res.response(apiResponse);
      }
      const { id: requestorUserId } = requestorProfile;

      // Step get requestor role
      const requestorParticipant = await this.participantsRepo.findByUserAndForum(
        requestorUserId,
        forumId
      );
      if (!requestorParticipant) {
        apiResponse.forbidden('Requestor is not a member of this forum');
        return res.response(apiResponse);
      }
      const { role: requestorRole } = requestorParticipant;

      // Step validate requestor is authorized to perform the request
      const isSelfPromotion = requestorUsername === targetParticipant.username;
      const roleIsAuthorized =
        requestorRole === Roles.Operator ||
        requestorRole === Roles.Administrator;
      if (!roleIsAuthorized || isSelfPromotion) {
        apiResponse.forbidden(
          'Requestor role does not have sufficient permissions on this forum'
        );
        return res.response(apiResponse);
      }

      // Step validate current operator cannot be modified
      if (targetParticipant.role === Roles.Operator) {
        apiResponse.forbidden(
          'Current role does not have sufficient permissions to perform this action.'
        );
        return res.response(apiResponse);
      }
      // #endregion validate user permissions

      // Step replace current operator by the provided one
      if (body.role === Roles.Operator) {
        if (requestorRole !== Roles.Operator) {
          apiResponse.forbidden(
            'Missing role permissions to perform this action'
          );
          return res.response(apiResponse);
        }

        const updateRequestor = await this.participantsRepo.modify(
          requestorParticipant.id,
          {
            role: Roles.Administrator,
          }
        );
        if (!updateRequestor) {
          apiResponse.unprocessableEntity('Cannot modify current operator');
          return res.response(apiResponse);
        }
      }

      const updatedParticipant = await this.participantsRepo.modify(
        participantId,
        { role: body.role }
      );
      if (!updatedParticipant) {
        apiResponse.unprocessableEntity('Forum participant cannot be updated');
        return res.response(apiResponse);
      }
      apiResponse.ok(updatedParticipant);
    } catch (err) {
      console.log(err);
      apiResponse.internalServerError(err.message);
    }
    return res.response(apiResponse);
  };
}

module.exports = ParticipantsController;
