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

  // test('When username filter is invalid, expect a validation error');

  // test('When email filter is invalid, expect a validation error');
});

describe('Users Controller GetForums', () => {
  afterEach(() => {
    if (ForumsRepository.prototype.find)
      ForumsRepository.prototype.find.mockReset();
  });

  test('When filters are provided, expect response to be successful', async () => {
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
      fields: [`Field 'page' expected to be Numeric. Got: ${page}`],
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
      fields: [`Field 'pageSize' expected to be Numeric. Got: ${pageSize}`],
    });
  });

  // TODO -> pending test scenarios
  // until validator V2 is developed and implemented.
  // ('When author param is invalid, expect a validation error on response');
  // ('When topic param is invalid, expect a validation error on response');
  // ('When sortBy param is invalid, expect a validation error on response');
  // ('When sortOrder param is invalid, expect a validation error on response');
  // test('When public filter is invalid, expect a validation error', async () => {});
});
