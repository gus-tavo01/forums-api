require('dotenv').config();
const { getMockReq } = require('@jest-mock/express');
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const ParticipantsController = require('../../../controllers/Participants.Controller');
// repositories
const ForumsRepository = require('../../../repositories/Forums.Repository');
const AccountsRepository = require('../../../repositories/Accounts.Repository');
const ParticipantsRepository = require('../../../repositories/Participants.Repository');
// mocks
jest.mock('../../../repositories/Forums.Repository');
jest.mock('../../../repositories/Accounts.Repository');
jest.mock('../../../repositories/Participants.Repository');

const participantsController = new ParticipantsController();

afterEach(() => {
  clearMockRes();
});

describe('Participants Controller POST', () => {
  test('When participant data is valid, expect a successful response', async () => {
    // Arrange
    const participantData = { username: 'ticky.perez', role: 'Participant' };
    const requestor = { username: 'testerDeveloper001', role: 'Operator' };
    const forumId = '610ee6890a25e341708f1706';
    const participantUserId = '610ee6890a25e341708f1703';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: requestor,
    });

    // mocks
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      id: '615ee6890a25e341408f1503',
      username: requestor.username,
      role: requestor.role,
    });
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      id: participantUserId,
      isActive: true,
    }));
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce(
      null
    );
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: true,
      participants: 10,
    }));
    const mockGetParticipant = {
      ...participantData,
      userId: participantUserId,
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
      user: { role: 'Administrator', username: 'unit.test' },
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
      user: { role: 'Administrator', username: 'unit.test' },
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

  test('When requestor is not authenticated, expect a 403 response', async () => {
    // Arrange
    const forumId = 5;
    const req = getMockReq({
      body: { username: 'dev.user', role: 'Operator' },
      params: { forumId },
      user: null,
    });

    // Act
    const response = await participantsController.post(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 401,
      errorMessage: 'Authentication required',
      message: 'Unauthorized',
      payload: null,
      fields: [],
    });
  });

  test('When requestor role is unauthorized, expect a 403 response', async () => {
    // Arrange
    const username = 'testerDeveloper001';
    const participantData = { username: 'ticky.perez', role: 'Participant' };
    const requestor = { username, role: 'Operator' };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: requestor,
    });

    // mocks
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn(async () => ({
      role: 'Participant',
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

  test('When requestor is not a forum member, expect a 403 response', async () => {
    // Arrange
    const username = 'testerDeveloper001';
    const participantData = { username: 'ticky.perez', role: 'Participant' };
    const requestor = { username, role: 'Operator' };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: requestor,
    });

    // mocks
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
      errorMessage: `${username} is not a member of this forum`,
      fields: [],
    });
  });

  test('When target user role is invalid, expect a 422 response', async () => {
    // Arrange
    const username = 'unit.test003';
    const participantData = { username: 'yayis.loera', role: 'Obispo' };
    const requestor = { username, role: 'Operator' };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: requestor,
    });

    // mocks
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: requestor.role,
    });

    // Act
    const apiResponse = await participantsController.post(req, res);

    // Assert
    expect(apiResponse).toMatchObject({
      payload: null,
      statusCode: 422,
      message: 'Unprocessable_Entity',
      errorMessage: `Forum participant role: '${participantData.role}' is incorrect`,
      fields: [],
    });
  });

  // test('When request is an operator transfer and requestor role is invalid, expect a 403 response', async () => {});

  // test('When request is an operator transfer and request is valid, expect to be success', async () => {});

  // test('When update current operator fails, expect a 422 response', async () => {});

  test('When source account is not found, expect a 422 response', async () => {
    // Arrange
    const username = 'developer002';
    const participantData = { username: 'yayis.loera', role: 'Viewer' };
    const requestor = { username, role: 'Operator' };
    const forumId = '610ee6890a25e341708f1706';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: requestor,
    });

    // mocks
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

  // test('When source account is inactive, expect a 422 response', async () => {});

  // test('When source user is already a forum member, expect a 409 response', async () => {});

  // test('When target forum is not found, expect a 422 response', async () => {});

  // test('When target forum is inactive, expect a 422 response', async () => {});

  // test('When create participant process fails, expect a 422 response and rollback', async () => {});

  // test('When modify forum participants count fails, expect the process to be rollbacked', async () => {});
});

describe('Participants Controller DELETE', () => {
  test('When request data is valid, expect participant to be removed from forum', async () => {
    // Arrange
    const forumId = '610ee6890a25e341708f1702';
    const userId = '650ee6890a25e341708f1505';
    const username = 'unit.user';
    const req = getMockReq({
      params: { userId, forumId },
      user: {
        username: 'Unit.Test',
      },
    });

    // mocks
    ParticipantsRepository.prototype.findByUserAndForum = jest.fn();
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      role: 'Operator',
    });
    AccountsRepository.prototype.findByUserId = jest.fn(async () => ({
      userId,
      username,
      isActive: true,
      role: 'Administrator',
      avatar: 'images/butt.jpg',
    }));
    ParticipantsRepository.prototype.findByUserAndForum.mockResolvedValueOnce({
      id: '650ee6890a25e341708f1606',
      username,
      role: 'Participant',
      avatar: null,
      userId,
    });
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      isActive: true,
      participants: 25,
    }));
    ParticipantsRepository.prototype.remove = jest.fn(async () => ({
      username,
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
      payload: username,
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
      fields: [`Field 'userId' expected to be GUID. Got: ${userId}`],
      errorMessage: 'Validation errors',
      message: 'Bad_Request',
      payload: null,
    });
  });

  // test('When requestor role is not valid, expect a 403 response', async () => {});

  // test('When source participant is not found, expect a 404 response', async () => {});

  // test('When source participant is inactive, expect a 422 response', async () => {});

  // test('When target forum is inactive, expect a 422 response', async () => {});

  // test('When target role is operator, expect a 403 response', async () => {});

  // test('When target forum is not found, expect a 422 response', async () => {});

  // test('When the participant is not removed, expect a 422 response', async () => {});

  // test('When target forum is not updated, expect process to be rollback', async () => {});
});
