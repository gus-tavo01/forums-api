require('dotenv').config();
const { getMockReq } = require('@jest-mock/express');
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const ParticipantsController = require('../../../controllers/Participants.Controller');
// repositories
const ForumsRepository = require('../../../repositories/Forums.Repository');
const AccountsRepository = require('../../../repositories/Accounts.Repository');
const UsersRepository = require('../../../repositories/Users.Repository');
const ParticipantsRepository = require('../../../repositories/Participants.Repository');
// constants
const Roles = require('../../../common/constants/roles');
// mocks
jest.mock('../../../repositories/Forums.Repository');
jest.mock('../../../repositories/Accounts.Repository');
jest.mock('../../../repositories/Users.Repository');
jest.mock('../../../repositories/Participants.Repository');

const participantsController = new ParticipantsController();

afterEach(() => {
  clearMockRes();
});

describe('Participants Controller POST', () => {
  test('When participant data is valid, expect a successful response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1706';
    const newParticipant = {
      username: 'ticky.perez',
      role: Roles.Participant,
      userId: '610ee6890a25e341708f1703',
    };
    const requestor = {
      userId: '510ee6890a25a331708f1201',
      username: 'testerDeveloper001',
      role: Roles.Operator,
    };

    const req = getMockReq({
      params: { forumId },
      body: {
        username: newParticipant.username,
        role: newParticipant.role,
      },
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn();
    UsersRepository.prototype.findByUsername.mockResolvedValueOnce({
      id: requestor.userId,
      username: requestor.username,
    });
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: true,
    }));
    UsersRepository.prototype.findByUsername.mockResolvedValueOnce({
      id: newParticipant.userId,
      avatar: null,
    });
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce(
      null
    );
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: true,
      participants: 10,
    }));
    const mockGetParticipant = {
      username: newParticipant.username,
      role: newParticipant.role,
      userId: newParticipant.userId,
      forumId,
    };
    ParticipantsRepository.prototype.add = jest.fn(
      async () => mockGetParticipant
    );
    ForumsRepository.prototype.modify = jest.fn(async () => ({
      id: forumId,
    }));

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: mockGetParticipant,
      statusCode: 200,
      errorMessage: null,
      fields: [],
    });
  });

  test('When request body is invalid, expect a 400 response with validation errors', async () => {
    // Arrange
    const req = getMockReq({
      body: { username: null, role: true },
      params: { forumId: '615ee6890a25e341708f4706' },
      user: { username: 'unit.test' },
    });

    // Act
    const response = await participantsController.post(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      errorMessage: 'Validation errors',
      message: 'Bad_Request',
      payload: null,
      fields: [
        `Field 'username' expected to be nonEmptyString. Got: null`,
        `Field 'role' expected to be nonEmptyString. Got: true`,
      ],
    });
  });

  test('When forumId is invalid, expect a 400 response with validation errors', async () => {
    // Arrange
    const forumId = 550;
    const req = getMockReq({
      body: { username: 'dev.user', role: 'Operator' },
      params: { forumId },
      user: { username: 'unit.test' },
    });

    // Act
    const response = await participantsController.post(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      errorMessage: 'Validation errors',
      message: 'Bad_Request',
      payload: null,
      fields: [
        `Field 'forumId' expected to be nonEmptyString. Got: ${forumId}`,
        `Field 'forumId' expected to be GUID. Got: ${forumId}`,
      ],
    });
  });

  test('When requestor role is unauthorized, expect a 403 response', async () => {
    // Arrange
    const username = 'testerDeveloper001';
    const requestor = { username, role: 'Operator', userId: '546asd56af65' };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: { username: 'ticky.perez', role: Roles.Participant },
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: Roles.Participant,
    }));

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 403,
      message: 'Forbidden',
      errorMessage: `${username} does not have the required role permissions`,
      fields: [],
    });
  });

  // #region broken
  test('When requestor is not a forum member, expect a 403 response', async () => {
    // Arrange
    const source = { username: 'ticky.perez', role: 'Participant' };
    const requestor = {
      username: 'testerDeveloper001',
      userId: '610ee6890a25e341708f1999',
    };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: { username: source.username, role: source.role },
      user: requestor,
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(
      async () => null
    );

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 403,
      message: 'Forbidden',
      errorMessage: `${requestor.username} is not a member of this forum`,
      fields: [],
    });
  });

  test('When target user role is invalid, expect a 422 response', async () => {
    // Arrange
    const username = 'Unit.Test003';
    const source = { username: 'yayis.loera', role: 'Obispo' };
    const requestor = {
      username,
      role: 'Operator',
      userId: '610ee6890a25e341708fasdfsg4356',
    };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: { username: source.username, role: source.role },
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: requestor.role,
    }));

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: `Forum participant role: '${source.role}' is incorrect`,
      fields: [],
    });
  });

  test('When request is an operator transfer and requestor role is invalid, expect a 403 response', async () => {
    // Arrange
    const source = { username: 'any.one', role: Roles.Pperator };
    const requestor = { username: 'anyone01', role: Roles.Administrator };
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706' },
      body: { username: source.username, role: source.role },
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: requestor.role,
    }));

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 403,
      message: 'Forbidden',
      errorMessage: `${requestor.username} is not the current forum operator`,
      fields: [],
    });
  });

  test('When request is an operator transfer and request is valid, expect to be success', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1706';
    const source = {
      username: 'Current.Operator',
      role: Roles.Operator,
      userId: '610ee6899a25e341708f1209',
    };
    const requestor = { username: 'newOperator002', role: Roles.Operator };
    const req = getMockReq({
      params: { forumId },
      body: { username: source.username, role: source.role },
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      id: source.userId,
      isActive: true,
    }));
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce(
      null
    );
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: false,
      participants: 10,
    }));
    ParticipantsRepository.prototype.modify = jest.fn(async () => ({
      role: Roles.Operator,
    }));
    ParticipantsRepository.prototype.add = jest.fn(async () => ({
      ...source,
      forumId,
    }));
    ForumsRepository.prototype.modify = jest.fn(async () => ({
      id: forumId,
    }));

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(ParticipantsRepository.prototype.modify).toHaveBeenCalled();
    expect(apiResponse).toMatchObject({
      payload: {
        forumId,
        ...source,
      },
      statusCode: 200,
      message: 'Ok',
      errorMessage: null,
      fields: [],
    });
  });

  test('When update current operator fails, expect a 422 response and process to be canceled', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1706';
    const participantData = {
      username: 'old.operator',
      role: Roles.Operator,
      userId: '610ee6899a25e341708f1209',
    };
    const requestorData = { username: 'newOperator002', role: Roles.Operator };
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: { username: requestorData.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestorData.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestorData.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      id: participantData.userId,
      isActive: true,
    }));
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce(
      null
    );
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: false,
      participants: 10,
    }));
    ParticipantsRepository.prototype.modify = jest.fn(async () => null);
    ParticipantsRepository.prototype.add = jest.fn();
    ForumsRepository.prototype.modify = jest.fn();

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(ParticipantsRepository.prototype.modify).toHaveBeenCalled();
    expect(ParticipantsRepository.prototype.add).not.toHaveBeenCalled();
    expect(ForumsRepository.prototype.modify).not.toHaveBeenCalled();
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: 'Cannot modify current operator',
      fields: [],
    });
  });

  test('When source account is not found, expect a 422 response', async () => {
    // Arrange
    const username = 'developer002';
    const source = { username: 'yayis.loera', role: Roles.Viewer };
    const requestor = {
      username,
      role: 'Operator',
      userId: '610ab6890a25e341708f1306',
    };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: { username: source.username, role: source.role },
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => null);

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: `Invalid participant`,
      fields: [],
    });
  });

  test('When source account is inactive, expect a 422 response', async () => {
    // Arrange
    const username = 'developer002';
    const source = { username: 'yayis.loera', role: 'Viewer' };
    const requestor = {
      username,
      role: 'Operator',
      userId: '610ee6890a25e341708f1997',
    };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: { username: source.username, role: source.role },
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: false,
    }));

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: `Invalid participant`,
      fields: [],
    });
  });

  test('When source user is already a forum member, expect a 409 response', async () => {
    // Arrange
    const participantData = { username: 'yayis.loera', role: Roles.Viewer };
    const userId = '610ee6890a25e341708f1111';
    const requestor = {
      username: 'Developer002',
      role: Roles.Administrator,
      userId: '610ee6890a25e341708f1705',
    };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: true,
      userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      userId,
      forumId,
    });

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 409,
      message: 'Conflict',
      errorMessage: `${participantData.username} is a member of this forum already`,
      fields: [],
    });
  });

  test('When target forum is not found, expect a 422 response', async () => {
    // Arrange
    const participantData = { username: 'yayis.loera', role: Roles.Viewer };
    const userId = '610ee6890a25e341708f1111';
    const requestor = {
      username: 'developer002',
      role: Roles.Operator,
      userId: '610ee6890a25e3134v08f1706',
    };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: true,
      userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce(
      null
    );
    ForumsRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: 'Invalid forum',
      fields: [],
    });
  });

  test('When target forum is inactive on normal request, expect a 422 response', async () => {
    // Arrange
    const participantData = {
      username: 'yayis.loera',
      role: Roles.Participant,
    };
    const userId = '610ee6890a25e341708f1111';
    const requestor = {
      username: 'developer004',
      role: Roles.Operator,
      userId: 'adasdasbvbn77f7dfbd7f6g',
    };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: true,
      userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce(
      null
    );
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: false,
    }));

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: 'Invalid forum',
      fields: [],
    });
  });

  test('When modify forum participants count fails, expect the process to be rollbacked', async () => {
    // Arrange
    const username = 'developer002';
    const participantData = {
      username: 'yayis.loera',
      role: Roles.Administrator,
    };
    const userId = '610ee6890a25e341708f1111';
    const requestor = {
      username,
      role: 'Operator',
      userId: '76sdf75dfg765dfg765dgf756',
    };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: { username: requestor.username },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: true,
      userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce(
      null
    );
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: true,
    }));
    ParticipantsRepository.prototype.add = jest.fn(async () => ({
      id: '610ee6890a25e341708f1606',
      userId,
      forumId,
    }));
    ForumsRepository.prototype.modify = jest.fn(async () => null);
    ParticipantsRepository.prototype.remove = jest.fn();

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(ParticipantsRepository.prototype.remove).toHaveBeenCalled();
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: 'Cannot update the forum, please try again later',
      fields: [],
    });
  });
});

describe('Participants Controller DELETE', () => {
  test('When request data is valid, expect participant to be removed from forum', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const targetParticipant = {
      participantId: '650ee6890a25e341708f3000',
      userId: '650ee6890a25e341708f1505',
      username: 'Will.Remove',
      role: Roles.Participant,
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Operator,
    };
    const req = getMockReq({
      params: { userId: targetParticipant.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    ParticipantsRepository.prototype.findById = jest.fn(async () => ({
      id: targetParticipant.participantId,
      username: targetParticipant.username,
      role: targetParticipant.role,
      avatar: null,
      userId: targetParticipant.userId,
    }));
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      username: targetParticipant.username,
      isActive: true,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: true,
      participants: 25,
    }));
    ParticipantsRepository.prototype.remove = jest.fn(async () => ({
      username: targetParticipant.username,
    }));
    ForumsRepository.prototype.modify = jest.fn(async () => ({
      id: forumId,
    }));

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      fields: [],
      errorMessage: null,
      message: 'Ok',
      payload: targetParticipant.username,
    });
  });

  test('When forumId is not valid, expect a validation error', async () => {
    // Arrange
    const forumId = 18;
    const userId = '650ee6890a25e341708f1505';
    const req = getMockReq({
      params: { userId, forumId },
      user: {
        role: 'Operator',
        username: 'Unit.Test',
      },
    });

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      fields: [
        `Field 'forumId' expected to be nonEmptyString. Got: ${forumId}`,
        `Field 'forumId' expected to be GUID. Got: ${forumId}`,
      ],
      errorMessage: 'Validation errors',
      message: 'Bad_Request',
      payload: null,
    });
  });

  test('When userId is not valid, expect a validation error', async () => {
    // Arrange
    const forumId = '650ee6890a25e341708f1505';
    const userId = '18mil';
    const req = getMockReq({
      params: { userId, forumId },
      user: {
        role: 'Operator',
        username: 'Unit.Test',
      },
    });

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      fields: [`Field 'participantId' expected to be GUID. Got: ${userId}`],
      errorMessage: 'Validation errors',
      message: 'Bad_Request',
      payload: null,
    });
  });

  test('When requestor role is not valid, expect a 403 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const target = {
      participantId: '650ee6890a25e341708f3000',
      userId: '650ee6890a25e341708f1505',
      username: 'Will.Remove',
      role: Roles.Participant,
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Viewer,
    };
    const req = getMockReq({
      params: { userId: target.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: requestor.role,
    }));

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 403,
      fields: [],
      errorMessage: 'Requestor role does not have sufficient permissions',
      message: 'Forbidden',
      payload: null,
    });
  });

  test('When requestor is not member of the forum, expect a 403 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const target = {
      participantId: '650ee6890a25e341708f3000',
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Viewer,
    };
    const req = getMockReq({
      params: { userId: target.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(
      async () => null
    );

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 403,
      fields: [],
      errorMessage: 'Requestor is not a member of this forum',
      message: 'Forbidden',
      payload: null,
    });
  });

  test('When source participant is not found, expect a 404 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const target = {
      participantId: '650ee6890a25e341708f3000',
      username: 'Will.Remove',
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Operator,
    };
    const req = getMockReq({
      params: { userId: target.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn();
    UsersRepository.prototype.findByUsername.mockResolvedValueOnce({
      id: requestor.userId,
    });
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: requestor.role,
    }));
    ParticipantsRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 404,
      fields: [],
      errorMessage: `${target.participantId} is not member of this forum`,
      message: 'Not_Found',
      payload: null,
    });
  });

  test('When source participant is inactive, expect a 422 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const target = {
      participantId: '650ee6890a25e341708f3000',
      username: 'Will.Remove',
      role: Roles.Participant,
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Operator,
    };
    const req = getMockReq({
      params: { userId: target.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn();
    UsersRepository.prototype.findByUsername.mockResolvedValueOnce({
      id: requestor.userId,
    });
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: requestor.role,
    }));
    ParticipantsRepository.prototype.findById = jest.fn(async () => ({
      username: target.username,
      role: target.role,
    }));
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: false,
    }));

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      fields: [],
      errorMessage: 'Invalid participant',
      message: 'Unprocessable_Entity',
      payload: null,
    });
  });

  test('When target role is operator, expect a 403 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const target = {
      participantId: '650ee6890a25e341708f3000',
      username: 'Will.Remove',
      role: Roles.Operator,
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Administrator,
    };
    const req = getMockReq({
      params: { userId: target.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn();
    UsersRepository.prototype.findByUsername.mockResolvedValueOnce({
      id: requestor.userId,
    });
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: requestor.role,
    }));
    ParticipantsRepository.prototype.findById = jest.fn(async () => ({
      username: target.username,
      role: target.role,
    }));

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 403,
      fields: [],
      errorMessage: 'Forum Operator cannot be removed',
      message: 'Forbidden',
      payload: null,
    });
  });

  test('When target forum is not found, expect a 422 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const target = {
      participantId: '650ee6890a25e341708f3000',
      username: 'Will.Remove',
      role: Roles.Participant,
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Operator,
    };
    const req = getMockReq({
      params: { userId: target.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn();
    UsersRepository.prototype.findByUsername.mockResolvedValueOnce({
      id: requestor.userId,
    });
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: requestor.role,
    }));
    ParticipantsRepository.prototype.findById = jest.fn(async () => ({
      username: target.username,
      role: target.role,
    }));
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: true,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      fields: [],
      errorMessage: 'Invalid forum',
      message: 'Unprocessable_Entity',
      payload: null,
    });
  });

  test('When request is self for leaving forum, expect to be success', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const username = 'Unit.Test001';
    const role = Roles.Participant;
    const target = {
      participantId: '650ee6890a25e341708f3000',
      username,
      role,
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username,
      role,
    };
    const req = getMockReq({
      params: { userId: target.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn();
    UsersRepository.prototype.findByUsername.mockResolvedValueOnce({
      id: requestor.userId,
    });
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: requestor.role,
    }));
    ParticipantsRepository.prototype.findById = jest.fn(async () => ({
      username: target.username,
      role: target.role,
    }));
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      isActive: true,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
    }));
    ParticipantsRepository.prototype.remove = jest.fn(async () => ({
      username: target.username,
    }));
    ForumsRepository.prototype.modify = jest.fn(async () => ({
      id: forumId,
    }));

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      fields: [],
      errorMessage: null,
      message: 'Ok',
      payload: `${target.username}`,
    });
  });

  test('When the participant is not removed, expect a 422 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const targetParticipant = {
      participantId: '650ee6890a25e341708f3000',
      userId: '650ee6890a25e341708f1505',
      username: 'Will.Remove',
      role: Roles.Participant,
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Operator,
    };
    const req = getMockReq({
      params: { userId: targetParticipant.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    ParticipantsRepository.prototype.findById = jest.fn(async () => ({
      id: targetParticipant.participantId,
      username: targetParticipant.username,
      role: targetParticipant.role,
      avatar: null,
      userId: targetParticipant.userId,
    }));
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      username: targetParticipant.username,
      isActive: true,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: true,
      participants: 25,
    }));
    ParticipantsRepository.prototype.remove = jest.fn(async () => null);

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      fields: [],
      errorMessage: 'Cannot remove the participant, please try again later',
      message: 'Unprocessable_Entity',
      payload: null,
    });
  });

  test('When target forum is not updated, expect process to be rollback', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const target = {
      participantId: '650ee6890a25e341708f3000',
      userId: '650ee6890a25e341708f1505',
      username: 'Will.Remove',
      role: Roles.Participant,
    };
    const requestor = {
      userId: '650bb6890a25a341408f1705',
      username: 'Unit.User',
      role: Roles.Operator,
    };
    const req = getMockReq({
      params: { userId: target.participantId, forumId },
      user: {
        username: requestor.username,
      },
    });

    // mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestor.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });
    ParticipantsRepository.prototype.findById = jest.fn(async () => ({
      id: target.participantId,
      username: target.username,
      role: target.role,
      avatar: null,
      userId: target.userId,
    }));
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      username: target.username,
      isActive: true,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: true,
      participants: 25,
    }));
    ParticipantsRepository.prototype.remove = jest.fn(async () => ({
      username: target.username,
    }));
    ForumsRepository.prototype.modify = jest.fn(async () => null);
    ParticipantsRepository.prototype.add = jest.fn();

    // Act
    const response = await participantsController.delete(req, res);

    // Assert
    expect(ParticipantsRepository.prototype.add).toHaveBeenCalled();
    expect(response).toMatchObject({
      statusCode: 422,
      fields: [],
      errorMessage: 'Cannot update the forum, please try again later',
      message: 'Unprocessable_Entity',
      payload: null,
    });
  });
});

describe('Participants Controller GET', () => {
  test('When request is valid, expect a list of participants', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1606';
    const requestor = { username: 'PEPITO001' };
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706' },
      query: { page: 1 },
      user: { username: requestor.username },
    });

    // #region mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: '610bb6890a25e341708f6755',
      username: requestor.username,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isPrivate: false,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      forumId,
    }));
    ParticipantsRepository.prototype.find = jest.fn(async () => ({
      docs: [],
    }));
    // #endregion mocks

    // Act
    const response = await participantsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      errorMessage: null,
      fields: [],
      message: 'Ok',
    });
  });

  test('When target forum is private and user is part of the forum, expect success', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1606';
    const requestor = { username: 'PEPITO001' };
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706' },
      query: { page: 1 },
      user: { username: requestor.username },
    });

    // #region mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: '610bb6890a25e341708f6755',
      username: requestor.username,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isPrivate: true,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      forumId,
    }));
    ParticipantsRepository.prototype.find = jest.fn(async () => ({
      docs: [],
    }));
    // #endregion mocks

    // Act
    const response = await participantsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      errorMessage: null,
      fields: [],
      message: 'Ok',
    });
  });

  test('When target forum is private and user is not part of the forum, expect forbidden', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1606';
    const requestor = { username: 'PEPITO001' };
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706' },
      query: { page: 1 },
      user: { username: requestor.username },
    });

    // #region mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      username: requestor.username,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isPrivate: true,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(
      async () => null
    );
    ParticipantsRepository.prototype.find = jest.fn(async () => ({
      docs: [],
    }));
    // #endregion mocks

    // Act
    const response = await participantsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 403,
      fields: [],
      message: 'Forbidden',
    });
  });

  test('When target forum is not found, expect 422 response', async () => {
    // Arrange
    const requestor = { username: 'PEPITO001' };
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706' },
      query: { page: 1 },
      user: { username: requestor.username },
    });

    // #region mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: '610bb6890a25e341708f6755',
      username: requestor.username,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => null);
    // #endregion mocks

    // Act
    const response = await participantsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      fields: [],
      message: 'Unprocessable_Entity',
    });
  });

  test('When requestor user is not found, expect 422 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1606';
    const requestor = { username: 'PEPITO001' };
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706' },
      query: { page: 1 },
      user: { username: requestor.username },
    });

    // #region mocks
    UsersRepository.prototype.findByUsername = jest.fn(async () => null);
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isPrivate: false,
    }));
    // #endregion mocks

    // Act
    const response = await participantsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      fields: [],
      message: 'Unprocessable_Entity',
    });
  });

  test('When page is invalid, expect validation error response', async () => {
    // Arrange
    const requestor = { username: 'PEPITO001' };
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706' },
      query: { page: 'uno', pageSize: 2 },
      user: { username: requestor.username },
    });

    // Act
    const response = await participantsController.get(req, res);

    // Assert
    expect(response.fields).not.toBe(null);
    expect(response).toMatchObject({
      statusCode: 400,
      errorMessage: 'Validation errors',
      message: 'Bad_Request',
    });
  });

  test('When pageSize is invalid, expect validation error response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1606';
    const requestor = { username: 'PEPITO001' };
    const req = getMockReq({
      params: { forumId },
      query: { pageSize: false },
      user: { username: requestor.username },
    });

    // Act
    const response = await participantsController.get(req, res);

    // Assert
    expect(response.fields).not.toBe(null);
    expect(response).toMatchObject({
      statusCode: 400,
      errorMessage: 'Validation errors',
      message: 'Bad_Request',
    });
  });

  // TODO add rest of filters
});

describe('Participants Controller PATCH', () => {
  test('When request is valid and user has permissions, expect response to be success', async () => {
    // Arrange
    const requestorUser = {
      username: 'Jhon.Doe',
      userId: '625aa6890a25e341708c1899',
      participantId: '610ee6890a25e856708f1298',
      role: Roles.Administrator,
    };
    const targetForum = {
      id: '610ee6890a25e341708f1702',
    };
    const targetUser = {
      username: 'TargetMe',
      participantId: '610ee6890a25e541908e1852',
      role: Roles.Participant,
    };

    const body = { role: Roles.Administrator };
    const req = getMockReq({
      params: {
        forumId: targetForum.id,
        participantId: targetUser.participantId,
      },
      user: {
        username: requestorUser.username,
      },
      body,
    });

    // mocks
    ParticipantsRepository.prototype.findById = jest.fn();
    ParticipantsRepository.prototype.findById.mockResolvedValueOnce({
      id: targetUser.participantId,
      username: targetUser.username,
      role: targetUser.role,
    });
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: targetForum.id,
    }));
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: requestorUser.userId,
    }));
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      id: requestorUser.participantId,
      username: requestorUser.username,
      role: requestorUser.role,
    }));

    const expectedUpdatedUser = {
      id: targetUser.participantId,
      username: targetUser.username,
      role: body.role,
    };
    ParticipantsRepository.prototype.modify = jest.fn(
      async () => expectedUpdatedUser
    );

    // Act
    const response = await participantsController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      message: 'Ok',
      fields: [],
      payload: expectedUpdatedUser,
      errorMessage: null,
    });
  });

  // #region general validations
  test('When forumId is invalid, expect a validation error', async () => {
    // Arrange
    const forumId = 'false';
    const req = getMockReq({
      params: { forumId, participantId: '610ee6890a25e341708f1706' },
      user: { username: 'ticky-yayis' },
      body: { role: Roles.Participant },
    });

    // Act
    const response = await participantsController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      fields: [
        `Field 'forumId', expected to be a valid mongo id. Got: ${forumId}`,
      ],
    });
  });

  test('When participantId is invalid, expect a validation error', async () => {
    // Arrange
    const participantId = 32;
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706', participantId },
      user: { username: 'yayis' },
      body: { role: Roles.Participant },
    });

    // Act
    const response = await participantsController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      fields: [
        `Field 'participantId', expected to be a valid mongo id. Got: ${participantId}`,
      ],
    });
  });

  test('When request role is invalid, expect a 400 response', async () => {
    // Arrange
    const participantId = '610ee6890a25e341708f1955';
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706', participantId },
      user: { username: 'yayis' },
      body: { role: '' },
    });

    // Act
    const response = await participantsController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      fields: [`Field 'role', expected not to be empty. Got: `],
    });
  });

  test('When request role does not exist, expect a 422 response', async () => {
    // Arrange
    const participantId = '610ee6890a25e341708f1955';
    const newRole = 'Gatito';
    const req = getMockReq({
      params: { forumId: '610ee6890a25e341708f1706', participantId },
      user: { username: 'yayis' },
      body: { role: newRole },
    });

    // Act
    const response = await participantsController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: 'Invalid role',
      fields: [
        `Field 'role', expected to be in ${JSON.stringify(
          Object.keys(Roles)
        )}. Got: ${newRole}`,
      ],
    });
  });

  test('When target participant is not found, expect a 404 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const participantId = '610ee6890a25e541908e1852';

    const req = getMockReq({
      params: {
        forumId,
        participantId,
      },
      user: {
        username: 'Jhon.Doe',
      },
      body: {
        role: Roles.Administrator,
      },
    });

    // mocks
    ParticipantsRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const response = await participantsController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 404,
      message: 'Not_Found',
      fields: [],
      payload: null,
      errorMessage: `${participantId} is not member of this forum`,
    });
  });

  test('When target forum is not found, expect a 422 response', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const participantId = '610ee6890a25e541908e1852';

    const req = getMockReq({
      params: {
        forumId,
        participantId,
      },
      user: {
        username: 'Jhon.Doe',
      },
      body: {
        role: Roles.Administrator,
      },
    });

    // mocks
    ParticipantsRepository.prototype.findById = jest.fn(async () => ({
      id: participantId,
    }));
    ForumsRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const response = await participantsController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      message: 'Unprocessable_Entity',
      fields: [],
      payload: null,
      errorMessage: `Invalid forum`,
    });
  });
  // #endregion general validations

  // #region business logic
  // test('When requestor user is not participant of the target forum, expect a 403 response', async () => {});

  // test('When requestor user role is not authorized to update others role, expect a 403 response', async () => {});

  // test('When target participant is the forum operator, expect a 403 response', async () => {});

  // test('When role change is self, expect a 403 response', async () => {});

  // test('When request role is operator and requestor is not the current operator, expect a forbidden response', async () => {});

  // test('When request role is operator and requestor is the current operator, expect operator to be updated', async () => {});
  // #endregion business logic
});
