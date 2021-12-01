require('dotenv').config();
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const CommentsController = require('../../../controllers/Comments.controller');
const CommentsRepository = require('../../../repositories/Comments.Repository');
const UsersRepository = require('../../../repositories/Users.Repository');
const ForumsRepository = require('../../../repositories/Forums.Repository');
const ParticipantsRepository = require('../../../repositories/Participants.Repository');

jest.mock('../../../repositories/Comments.Repository');
jest.mock('../../../repositories/Users.Repository');
jest.mock('../../../repositories/Forums.Repository');
jest.mock('../../../repositories/Participants.Repository');

const commentsController = new CommentsController();

afterEach(() => {
  clearMockRes();
});

describe('Comments Controller GET', () => {
  test('When query params are valid, expect a successful response', async () => {
    // Arrange
    const forumId = '61606d471763a92d0c7fa31b';
    const req = getMockReq({
      params: {
        forumId,
      },
      query: {
        from: 'Ticky',
        to: 'Yayis',
      },
    });

    // mocks
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      topic: 'Cholo adventures',
      isPrivate: false,
    }));
    CommentsRepository.prototype.find = jest.fn(async () => [
      {
        from: 'Ticky',
        to: 'Yayis',
        message: 'I want more food',
        createDate: Date.now(),
        likes: [],
        dislikes: [],
        forumId,
      },
    ]);

    // Act
    const response = await commentsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Ok',
      statusCode: 200,
      errorMessage: null,
      fields: [],
    });
  });

  test('When the provided forum is private, expect a forbidden http response', async () => {
    // Arrange
    const forumId = '61606d471763a92d0c7fa31b';
    const req = getMockReq({
      params: {
        forumId,
      },
    });

    // mocks
    ForumsRepository.prototype.findById = jest.fn(async () => ({
      id: forumId,
      topic: 'Married man adventures',
      isPrivate: true,
    }));

    // Act
    const response = await commentsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Forbidden',
      statusCode: 403,
      errorMessage: 'You are not allowed to see this forum content',
      fields: [],
    });
  });

  test('Whe forumId is not a valid id, expect a validation error', async () => {
    // Arrange
    const forumId = '616061b';
    const req = getMockReq({
      params: {
        forumId,
      },
    });

    // Act
    const response = await commentsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      statusCode: 400,
      errorMessage: 'Validation errors',
      fields: [
        `Field 'forumId', expected to be a valid mongo id. Got: ${forumId}`,
      ],
    });
  });

  test('When from param is invalid, expect validation errors', async () => {
    // Arrange
    const forumId = '61606d471763a92d0c7fa31b';
    const from = '';

    const req = getMockReq({
      params: {
        forumId,
      },
      query: {
        from,
      },
    });

    // Act
    const response = await commentsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      statusCode: 400,
      errorMessage: 'Validation errors',
      fields: [`Field 'from', expected not to be empty. Got: ${from}`],
    });
  });

  test('When to param is invalid, expect validation errors', async () => {});

  test('When page param is invalid, expect validation errors', async () => {
    // Arrange
    const forumId = '61606d471763a92d0c7fa31b';
    const page = 'Three';
    const req = getMockReq({
      params: {
        forumId,
      },
      query: {
        page,
      },
    });

    // Act
    const response = await commentsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      statusCode: 400,
      errorMessage: 'Validation errors',
      fields: [`Field 'page', expected to be Numeric. Got: ${page}`],
    });
  });

  test('When pageSize param is invalid, expect validation errors', async () => {
    // Arrange
    const forumId = '61606d471763a92d0c7fa31b';
    const pageSize = 'Thirteen';
    const req = getMockReq({
      params: {
        forumId,
      },
      query: {
        pageSize,
      },
    });

    // Act
    const response = await commentsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      statusCode: 400,
      errorMessage: 'Validation errors',
      fields: [`Field 'pageSize', expected to be Numeric. Got: ${pageSize}`],
    });
  });

  test('When forumId param is invalid, expect validation errors', async () => {
    // Arrange
    const forumId = 'mongoIdasdasd3145';
    const req = getMockReq({
      params: {
        forumId,
      },
    });

    // Act
    const response = await commentsController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      fields: [
        `Field 'forumId', expected to be a valid mongo id. Got: ${forumId}`,
      ],
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
    });
  });
});

// TODO
// describe('Comments Controller POST', () => {});
