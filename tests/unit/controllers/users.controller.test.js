require('dotenv').config();
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const UsersController = require('../../../controllers/Users.Controller');
const UsersRepository = require('../../../repositories/Users.Repository');
const ForumsRepository = require('../../../repositories/Forums.Repository');

jest.mock('../../../repositories/Users.Repository');
jest.mock('../../../repositories/Forums.Repository');

const usersController = new UsersController();

//#region Test Suite Setup
beforeAll(() => {
  jest.setTimeout(5 * 60 * 1000);
});

afterEach(() => {
  clearMockRes();
});
//#endregion Test Suite Setup

describe('Users Controller GET', () => {
  test('When filters are valid, expect a successful response', async () => {
    // Arrange
    const req = getMockReq({
      query: { username: 'panco', email: 'paco.perez@gmail.com' },
      user: { username: 'ticky' },
    });
    const expectedUsers = {
      docs: [],
    };

    // mocks
    UsersRepository.prototype.find = jest.fn(async () => expectedUsers);

    // Act
    const response = await usersController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      errorMessage: null,
      fields: [],
      message: 'Ok',
      payload: expectedUsers,
    });
  });

  test('When filter page is invalid, expect a validation error', async () => {
    // Arrange
    const page = 'one';
    const req = getMockReq({
      query: { page },
      user: { username: 'yuzo-kun' },
    });

    // Act
    const response = await usersController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      payload: null,
      statusCode: 400,
      fields: [`Field 'page', expected to be Numeric. Got: ${page}`],
    });
  });

  test('When filter pageSize is invalid, expect a validation error', async () => {
    // Arrange
    const pageSize = true;
    const req = getMockReq({
      query: { pageSize },
      user: { username: 'yuzo-kun' },
    });

    // Act
    const response = await usersController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      payload: null,
      statusCode: 400,
      fields: [`Field 'pageSize', expected to be Numeric. Got: ${pageSize}`],
    });
  });

  test('When username filter is invalid, expect a validation error', async () => {
    // Arrange
    const req = getMockReq({
      query: { username: '' },
      user: { username: 'yayis-kun' },
    });

    // Act
    const response = await usersController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      payload: null,
      statusCode: 400,
      fields: ["Field 'username', expected not to be empty. Got: "],
    });
  });

  test('When email filter is invalid, expect a validation error', async () => {
    // Arrange
    const email = 'caca de gato';
    const req = getMockReq({
      query: { email },
      user: { username: 'yayis-kun' },
    });

    // Act
    const response = await usersController.get(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      payload: null,
      statusCode: 400,
      fields: [`Field 'email', expected to be a valid email. Got: ${email}`],
    });
  });

  // test('When isActive filters is invalid, expect a validation error');
});

describe('Users Controller GetById', () => {
  test('When user id is valid and user is found, expect a successful response', async () => {
    // Arrange
    const userId = '610ee6890a25e341708f1703';
    const req = getMockReq({
      params: { id: userId },
      user: 'Yusou-kun',
    });

    UsersRepository.prototype.findById = jest.fn(async () => ({
      id: userId,
    }));

    // Act
    const response = await usersController.getById(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      fields: [],
      errorMessage: null,
      message: 'Ok',
    });
  });

  test('When user is not found, expect a 404 response', async () => {
    // Arrange
    const userId = '610ee6890a25e341708f1703';
    const req = getMockReq({
      params: { id: userId },
      user: 'Yusou-kun',
    });

    UsersRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const response = await usersController.getById(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 404,
      fields: [],
      errorMessage: 'User is not found',
      message: 'Not_Found',
    });
  });

  test('When user id is invalid, expect a validation error', async () => {
    // Arrange
    const userId = 'adadsasd213efd';
    const req = getMockReq({
      params: { id: userId },
      user: 'Yusou-kun',
    });

    UsersRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const response = await usersController.getById(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      fields: [`Field 'id', expected to be a valid mongo id. Got: ${userId}`],
      errorMessage: 'Validation errors',
      message: 'Bad_Request',
    });
  });
});

describe('Users Controller GetForums', () => {
  afterEach(() => {
    if (ForumsRepository.prototype.find)
      ForumsRepository.prototype.find.mockReset();
  });

  test('When valid filters are provided, expect response to be successful', async () => {
    // Arrange
    const targetUser = 'Ice-Cream01';
    const req = getMockReq({
      query: {
        page: 1,
        pageSize: 15,
      },
      user: { username: targetUser },
    });

    // mocks
    UsersRepository.prototype.findById = jest.fn(async () => ({
      username: targetUser,
    }));
    ForumsRepository.prototype.findByUser = jest.fn(async () => []);

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      fields: [],
      errorMessage: null,
      message: 'Ok',
    });
  });

  test('When requestor is not the target user, expect to be forbidden', async () => {
    // Arrange
    const req = getMockReq({
      query: {
        page: 1,
        pageSize: 15,
      },
      user: {
        username: 'Benito.Camela',
      },
    });

    // #region mocks
    UsersRepository.prototype.findById = jest.fn(async () => ({
      username: 'targetUser',
    }));
    ForumsRepository.prototype.find = jest.fn(async () => []);
    // #endregion mocks

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 403,
      fields: [],
      errorMessage: 'Cannot view other users private forums',
      message: 'Forbidden',
    });
  });

  test('When target user is not found, expect an error response', async () => {
    // Arrange
    const req = getMockReq({
      query: {
        page: 1,
        pageSize: 15,
      },
      user: {
        username: 'Benito.Camela',
      },
    });

    // #region mocks
    UsersRepository.prototype.findById = jest.fn(async () => null);
    ForumsRepository.prototype.find = jest.fn(async () => []);
    // #endregion mocks

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      fields: [],
      errorMessage: 'User resource is not found',
      message: 'Unprocessable_Entity',
    });
  });

  test('When page param is invalid, expect a validation error on response', async () => {
    // Arrange
    const page = 'TwentyOne';
    const req = getMockReq({
      query: { page },
      user: { username: 'Pepito' },
    });

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [`Field 'page', expected to be Numeric. Got: ${page}`],
    });
  });

  test('When pageSize param is invalid, expect a validation error on response', async () => {
    // Arrange
    const pageSize = 'TwentyTwo';
    const req = getMockReq({
      query: { pageSize },
      user: { username: 'Kiko Vega' },
    });

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [`Field 'pageSize', expected to be Numeric. Got: ${pageSize}`],
    });
  });

  test('When author param is invalid, expect a validation error on response', async () => {
    // Arrange
    const author = ' ';
    const req = getMockReq({
      query: { author },
      user: { username: 'Richie-Rich' },
    });

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [`Field 'author', expected not to be empty. Got: ${author}`],
    });
  });

  test('When topic param is invalid, expect a validation error on response', async () => {
    // Arrange
    const topic = 90;
    const req = getMockReq({
      query: { topic },
      user: { username: 'SelenaG' },
    });

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [`Field 'topic', expected not to be empty. Got: ${topic}`],
    });
  });

  test('When public filter is invalid, expect a validation error', async () => {
    // Arrange
    const isPublic = 'yes';
    const req = getMockReq({
      query: { public: isPublic },
      user: { username: 'ticky-tic' },
    });

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [`Field 'public', expected to be Boolean. Got: ${isPublic}`],
    });
  });

  test('When sortBy param is invalid, expect a validation error on response', async () => {
    // Arrange
    const sortBy = 'muny';
    const req = getMockReq({
      query: { sortBy },
      user: { username: 'ticky-ti' },
    });

    const expectedValues = [
      'lastActivity',
      'topic',
      'author',
      'createDate',
      'updateDate',
      'participants',
      'comments',
      'isActive',
    ];

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [
        `Field 'sortBy', expected to be in ${JSON.stringify(
          expectedValues
        )}. Got: ${sortBy}`,
      ],
    });
  });

  test('When sortOrder param is invalid, expect a validation error on response', async () => {
    // Arrange
    const sortOrder = 'normal';
    const req = getMockReq({
      query: { sortOrder },
      user: { username: 'yayis-kun' },
    });

    const expectedValues = ['asc', 'desc'];

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
      payload: null,
      fields: [
        `Field 'sortOrder', expected to be in ${JSON.stringify(
          expectedValues
        )}. Got: ${sortOrder}`,
      ],
    });
  });
});

describe('Users Controller PATCH', () => {
  test('When req data is provided, expect user to be updated', async () => {
    // Arrange
    const userId = '61606d471763a92d0c7fa31b';
    const description = 'Patch request donas';
    const req = getMockReq({
      params: { id: userId },
      body: {
        selfDescription: description,
      },
    });

    UsersRepository.prototype.findById = jest.fn(async () => ({
      id: userId,
    }));
    UsersRepository.prototype.modify = jest.fn(async () => ({
      id: userId,
      selfDescription: description,
    }));

    // Act
    const response = await usersController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      fields: [],
      errorMessage: null,
      message: 'Ok',
      payload: { id: userId },
    });
  });

  test('When target user is not found, expect a 404 status', async () => {
    // Arrange
    const userId = '61606d471763a92d0c7fa31b';
    const req = getMockReq({
      params: { id: userId },
      body: {
        selfDescription: 'El ticky is a good friend',
      },
    });

    UsersRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const response = await usersController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 404,
      fields: [],
      errorMessage: 'User is not found',
      message: 'Not_Found',
      payload: null,
    });
  });

  test('When param userId is invalid, expect a validation error', async () => {
    // Arrange
    const userId = Date.now();
    const req = getMockReq({
      params: { id: userId },
    });

    // Act
    const response = await usersController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      payload: null,
      fields: [
        `Field 'userId', expected to be a valid mongo id. Got: ${userId}`,
      ],
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
    });
  });

  test('When selfDescription is provided and is invalid, expect a validation error', async () => {
    // Arrange
    const userId = '61606d471763a92d0c7fa31b';
    const req = getMockReq({
      params: { id: userId },
      body: {
        selfDescription: true,
      },
    });

    // Act
    const response = await usersController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      payload: null,
      fields: [`Field 'selfDescription', expected to be String. Got: ${true}`],
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
    });
  });

  test('When language is provided and is invalid, expect a validation error', async () => {
    // Arrange
    const userId = '61606d471763a92d0c7fa31b';
    const req = getMockReq({
      params: { id: userId },
      body: {
        language: 69,
      },
    });

    // Act
    const response = await usersController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      payload: null,
      fields: [`Field 'language', expected not to be empty. Got: 69`],
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
    });
  });

  test('When appTheme is provided and is invalid, expect a validation error', async () => {
    // Arrange
    const userId = '61606d471763a92d0c7fa31b';
    const req = getMockReq({
      params: { id: userId },
      body: {
        appTheme: '',
      },
    });

    // Act
    const response = await usersController.patch(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      payload: null,
      fields: [`Field 'appTheme', expected not to be empty. Got: `],
      message: 'Bad_Request',
      errorMessage: 'Validation errors',
    });
  });
});
