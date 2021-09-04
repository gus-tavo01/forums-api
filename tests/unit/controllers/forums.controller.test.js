require('dotenv').config();
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const ForumsController = require('../../../controllers/Forums.Controller');
const ForumsRepository = require('../../../repositories/Forums.Repository');
const UsersRepository = require('../../../repositories/Users.Repository');
const ParticipantsRepository = require('../../../repositories/Participants.Repository');
const CloudinaryService = require('../../../services/Cloudinary.Service');

const mockImage = require('../../helpers/mockImageUrl');

// mocks
jest.mock('../../../repositories/Forums.Repository');
jest.mock('../../../repositories/Users.Repository');
jest.mock('../../../repositories/Participants.Repository');
jest.mock('../../../services/Cloudinary.Service');

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
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: 'Some1235idv7v6gdfhg98',
    }));
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

  test('When forum image is provided, expect response to be uploaded', async () => {
    // Arrange
    const username = 'r.janvan001';
    const imageId = 'asdadkjn7667sd7g';
    const forumData = {
      topic: 'new name or topic',
      description: 'Changes on arch',
      isPrivate: false,
      image: mockImage,
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
      topic: forumData.topic,
      description: forumData.description,
      isPrivate: forumData.isPrivate,
      image: imageId,
    };
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: 'Some1235idv7v6gdfhg98',
    }));
    CloudinaryService.prototype.uploadImage = jest.fn(async () => imageId);
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
        `Field 'isPrivate' expected to be Boolean. Got: ${forumData.isPrivate}`,
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
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: 'Some1235idv7v6gdfhg98',
    }));
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
    UsersRepository.prototype.findByUsername = jest.fn(async () => ({
      id: 'Some1235idv7v6gdfhg98',
    }));
    ForumsRepository.prototype.add = jest.fn(async () => {
      throw new Error(errorMessage);
    });

    // Act
    const response = await forumsController.post(req, res);

    // Assert
    expect(response).toMatchObject(expectedResponse);
  });
});

describe('Forums Controller GET by filters', () => {
  afterEach(() => {
    ForumsRepository.prototype.find.mockReset();
  });

  test('When valid filters are provided, expect response to be successful', async () => {
    // Arrange
    const req = getMockReq({
      query: {
        page: 1,
        pageSize: 15,
      },
    });

    // mocks
    ForumsRepository.prototype.find = jest.fn(async () => []);

    // Act
    const response = await forumsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      fields: [],
      errorMessage: null,
      message: 'Ok',
    });
  });

  test('When page param is invalid, expect a validation error on response', async () => {
    // Arrange
    const page = 'TwentyOne';
    const req = getMockReq({
      query: { page },
    });

    // mocks
    ForumsRepository.prototype.find = jest.fn(async () => []);

    // Act
    const response = await forumsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [`Field 'page' expected to be Numeric. Got: ${page}`],
    });
  });

  test('When pageSize param is invalid, expect a validation error on response', async () => {
    // Arrange
    const pageSize = 'TwentyTwo';
    const req = getMockReq({
      query: { pageSize },
    });

    // mocks
    ForumsRepository.prototype.find = jest.fn(async () => []);

    // Act
    const response = await forumsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [`Field 'pageSize' expected to be Numeric. Got: ${pageSize}`],
    });
  });

  test('When isActive param is invalid, expect a validation error on response', async () => {
    // Arrange
    const isActive = 'Yes, please';
    const req = getMockReq({
      query: { isActive },
    });

    // mocks
    ForumsRepository.prototype.find = jest.fn(async () => []);

    // Act
    const response = await forumsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [`Field 'isActive' expected to be Boolean. Got: ${isActive}`],
    });
  });

  // TODO -> pending test scenarios
  // until validator V2 is developed and implemented.
  // ('When author param is invalid, expect a validation error on response');
  // ('When topic param is invalid, expect a validation error on response');
  // ('When sortBy param is invalid, expect a validation error on response');
  // ('When sortOrder param is invalid, expect a validation error on response');
});
