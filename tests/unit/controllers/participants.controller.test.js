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
    const participantData = { username: 'ticky.perez', role: 'participant' };
    const requestor = { username: 'testerDeveloper001', role: 'Operator' };
    const forumId = '610ee6890a25e341708f1706';
    const participantUserId = '610ee6890a25e341708f1703';
    const req = getMockReq({
      params: { forumId },
      body: participantData,
      user: requestor,
    });

    // mocks
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      id: participantUserId,
      isActive: true,
    }));
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
    const req = getMockReq({
      body: { username: 'dev.user', role: 'Operator' },
      params: { forumId: 550 },
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
        `Field 'forumId' expected to be nonEmptyString. Got: null`,
        `Field 'forumId' expected to be GUID. Got: null`,
      ],
    });
  });

  // test('When requestor is not authenticated, expect a 403 response', async () => {});

  // test('When requestor role is unauthorized, expect a 403 response', async () => {});

  // test('When source account is not found, expect a 422 response', async () => {});

  // test('When source account is inactive, expect a 422 response', async () => {});

  // test('When target forum is not found, expect a 422 response', async () => {});

  // test('When target forum is inactive, expect a 422 response', async () => {});

  // test('When modify forum participants count fails, expect to rollback the participant', async () => {});
});
