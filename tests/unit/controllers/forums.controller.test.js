require('dotenv').config();
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const ForumsController = require('../../../controllers/Forums.Controller');
const ForumsRepository = require('../../../repositories/Forums.Repository');
const ParticipantsRepository = require('../../../repositories/Participants.Repository');

// mocks
jest.mock('../../../repositories/Forums.Repository');
jest.mock('../../../repositories/Participants.Repository');

const forumsController = new ForumsController();

afterEach(() => {
  clearMockRes();
});

describe('Forums Controller POST', () => {
  afterEach(() => {
    if (ForumsRepository.prototype.add) {
      ForumsRepository.prototype.add.mockReset();
    }
  });

  test('When provided forum data is valid, expect response to be success', async () => {
    // Arrange
    const username = 'r.janvan001';
    const forumData = {
      topic: 'new name or topic',
      description: 'Changes on arch',
      isPrivate: false,
    };
    const req = getMockReq({
      body: {
        ...forumData,
      },
      user: { username },
    });

    const mockAddForum = {
      id: 'someRandomId019475',
      createDate: Date.now(),
      participants: [],
      ...forumData,
    };
    ForumsRepository.prototype.add = jest.fn(async () => mockAddForum);
    ParticipantsRepository.prototype.add = jest.fn(async () => ({ username }));

    const expectedPayload = {
      ...mockAddForum,
    };

    // Act
    const response = await forumsController.post(req, res);

    // Assert
    expect(response).toMatchObject({
      payload: expectedPayload,
      statusCode: 201,
      fields: [],
      errorMessage: null,
      message: 'Created',
    });
  });

  test('When forum data is invalid, expect response to have validation errors', async () => {
    // Arrange
    const forumData = {};
    const req = getMockReq({
      body: forumData,
      user: { username: 'Paco.Perez01' },
    });
    const expectedResponse = {
      statusCode: 400,
      fields: [
        `Field 'topic' expected to be nonEmptyString. Got: ${forumData.topic}`,
        `Field 'description' expected to be nonEmptyString. Got: ${forumData.description}`,
        `Field 'isPrivate' expected to be boolean. Got: ${forumData.isPrivate}`,
      ],
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
    };

    // Act
    const response = await forumsController.post(req, res);

    // Assert
    expect(response).toMatchObject(expectedResponse);
  });

  test('When user is not authorized, expect response to be 401', async () => {
    // Arrange
    const req = getMockReq({
      body: {
        topic: 'Gym',
        description: 'Is cool',
        author: 'Me :p',
        isActive: false,
      },
    });

    // Act
    const response = await forumsController.post(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 401,
      errorMessage: 'Authorization required',
      message: 'Unauthorized',
      fields: [],
    });
  });

  test('When creating the forum participant fails, expect forum creation to rollback', async () => {
    // Arrange
    const username = 'r.janvan001';
    const forumData = {
      topic: 'new forum topic',
      description: 'Additional test scenario for this forum data',
      isPrivate: true,
    };
    const req = getMockReq({
      body: {
        ...forumData,
      },
      user: { username },
    });

    const mockAddForum = {
      id: 'someRandomId019475',
      createDate: Date.now(),
      participants: [],
      ...forumData,
    };
    ForumsRepository.prototype.add = jest.fn(async () => mockAddForum);
    ParticipantsRepository.prototype.add = jest.fn(async () => null);
    ForumsRepository.prototype.remove = jest.fn(async () => mockAddForum);

    // Act
    const response = await forumsController.post(req, res);

    // Assert
    expect(response).toMatchObject({
      payload: null,
      statusCode: 422,
      fields: [],
      errorMessage: 'Cannot add participant on forum',
      message: 'Unprocessable_Entity',
    });
  });

  test('When forums repo fails on adding a forum, expect to catch the error', async () => {
    // Arrange
    const forumData = {
      topic: 'Topic for this one',
      description: 'This is a description',
      isPrivate: true,
    };
    const req = getMockReq({
      body: forumData,
      user: { username: 'Panchito.g' },
    });
    const errorMessage = 'Something happened';
    const expectedResponse = {
      statusCode: 500,
      fields: [],
      message: 'Internal_Server_Error',
      payload: null,
      errorMessage,
    };

    // mocks
    ForumsRepository.prototype.add = jest.fn(async () => {
      throw new Error(errorMessage);
    });

    // Act
    const response = await forumsController.post(req, res);

    // Assert
    expect(response).toMatchObject(expectedResponse);
  });
});
