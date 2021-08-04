require('dotenv').config();
const { res, clearMockRes } = require('../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const ForumsController = require('../../../controllers/Forums.Controller');
const ForumsRepository = require('../../../repositories/Forums.Repository');

// mocks
jest.mock('../../../repositories/Forums.Repository');

const forumsController = new ForumsController();

//#region Test Suite Setup
beforeAll(() => {
  jest.setTimeout(5 * 60 * 1000);
});

afterEach(() => {
  clearMockRes();
});
//#endregion Test Suite Setup

describe('Forums Controller POST', () => {
  afterEach(() => {
    if (ForumsRepository.prototype.add) {
      ForumsRepository.prototype.add.mockReset();
    }
  });

  test('When provided forum data is valid, expect response to be success', async () => {
    // Arrange
    const forumData = {
      name: 'new name or topic',
      description: 'Changes on arch',
      isPrivate: false,
    };
    const req = getMockReq({
      body: {
        ...forumData,
      },
      user: { username: 'r.janvan001' },
    });

    const mockAddForum = {
      id: 'someRandomId019475',
      createDate: Date.now(),
      participants: [],
      ...forumData,
    };
    ForumsRepository.prototype.add = jest.fn(async () => mockAddForum);

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
        `Field 'name' is not a string`,
        `Field 'description' is not a string`,
        `Field 'isPrivate' is not a valid boolean`,
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

  test('When forums repo fails on adding a forum, expect to catch the error', async () => {
    // Arrange
    const forumData = {
      name: 'Topic for this one',
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
