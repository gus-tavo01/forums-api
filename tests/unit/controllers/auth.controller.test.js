require('dotenv').config();
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const AuthController = require('../../../controllers/Auth.Controller');
// repos
const AccountsRepository = require('../../../repositories/Accounts.Repository');
const UsersRepository = require('../../../repositories/Users.Repository');

const UsersService = require('../../../services/Users.Service');

jest.mock('../../../repositories/Accounts.Repository');
jest.mock('../../../repositories/Users.Repository');

jest.mock('../../../services/Users.Service');

const authController = new AuthController();

afterEach(() => {
  clearMockRes();
  if (AccountsRepository.prototype.findByUsername) {
    AccountsRepository.prototype.findByUsername.mockReset();
  }
});

describe('Auth controller login', () => {
  test('When credentials are valid, expect a successful 200 response', async () => {
    // Arrange
    const username = 'rs.joemon001';
    const password = 'password!';
    const req = getMockReq({
      body: {
        username,
        password,
      },
    });

    // mocks
    AccountsRepository.prototype.findByUsername = jest.fn(async () => ({
      username,
      passwordHash:
        '$2b$10$XDnIFdbz/R4qdLkhrAlco.LPJE2IlqdYOhKrprvGluBdS9vH.Ujzu',
    }));

    // Act
    const response = await authController.login(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Ok',
      statusCode: 200,
      payload: {
        expiresIn: '120 Minutes',
      },
      errorMessage: null,
      fields: [],
    });
  });

  test('When username is invalid, expect a 400 response', async () => {
    // Arrange
    const username = undefined;
    const password = 'password!';
    const req = getMockReq({
      body: {
        username,
        password,
      },
    });

    // Act
    const response = await authController.login(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      statusCode: 400,
      payload: null,
      errorMessage: 'Validation errors',
      fields: [
        `Field 'username' expected to be nonEmptyString. Got: ${username}`,
      ],
    });
  });

  test('When password is invalid, expect a 400 response', async () => {
    // Arrange
    const username = 'shaq.01';
    const password = null;
    const req = getMockReq({
      body: {
        username,
        password,
      },
    });

    // Act
    const response = await authController.login(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Bad_Request',
      statusCode: 400,
      payload: null,
      errorMessage: 'Validation errors',
      fields: [
        `Field 'password' expected to be nonEmptyString. Got: ${password}`,
      ],
    });
  });

  // test('When username does not exist, expect a 401 response', async () => {});

  // test('When password does not match, expect a 401 response', async () => {});

  // test('When an unhandled error occurs, expect a 500 response', async () => {});
});

describe('Auth controller register', () => {
  afterEach(() => {
    AccountsRepository.prototype.findByUsername.mockReset();
  });

  test('When user data is valid, expect a successful response', async () => {
    // Arrange
    const userId = 'ertuasd1344235sdf4';
    const username = 'paco.perez01';
    const req = getMockReq({
      body: {
        username,
        email: 'pac.per@gmail.com',
        dateOfBirth: '2000-02-16',
        password: 'password!',
      },
    });

    // mocks
    AccountsRepository.prototype.findByUsername = jest.fn(async () => null);
    UsersRepository.prototype.add = jest.fn(async () => ({
      id: userId,
    }));
    AccountsRepository.prototype.add = jest.fn(async () => ({
      username,
    }));

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 201,
      message: 'Created',
      payload: username,
      errorMessage: null,
      fields: [],
    });
  });

  test('When username already exists, expect a 409 http response', async () => {
    // Arrange
    const username = 'rickyTicky';
    const req = getMockReq({
      body: {
        username,
        password: 'password!',
        email: 'tiktok@gmail.com',
        dateOfBirth: '2010-10-21',
      },
    });

    const mockAccount = {
      username,
      email: 'ricky.ticky@gmail.com',
    };
    AccountsRepository.prototype.findByUsername = jest.fn(
      async () => mockAccount
    );

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 409,
      payload: null,
      message: 'Conflict',
    });
  });

  // test('When username is invalid, expect a 422 response with validation errors', async () => {});

  // test('When email is invalid, expect a 422 response with validation errors', async () => {});

  // test('When password is invalid, expect a 422 response with validation errors', async () => {});

  // test('When dateOfBirth is invalid, expect a 422 response with validation errors', async () => {});

  // test('When create account fails, expect to rollback user profile', async () => {});

  // test('When an exception occurs, expect a 500 server error', async () => {});
});

describe('Auth controller resetPassword', () => {
  test('When password is provided, expect to be successful', async () => {
    // Arrange
    const username = 'r.joemon001';
    const accountId = '610ee6890a25e341708f1805';
    const profileId = '610ee6890a25e341708f1703';
    const req = getMockReq({
      body: { password: '5up3r53cur3' },
      user: { username, id: accountId, userId: profileId },
      params: { userId: profileId },
    });

    // mocks
    UsersRepository.prototype.findById = jest.fn(async () => ({
      username,
      id: profileId,
    }));
    AccountsRepository.prototype.modify = jest.fn(async () => ({
      id: accountId,
      username,
      userId: profileId,
    }));

    // Act
    const response = await authController.resetPassword(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 200,
      message: 'Ok',
      fields: [],
      payload: username,
      errorMessage: null,
    });
  });

  test('When request is not self, expect a 403 response', async () => {
    // Arrange
    const username = 'rManuel';
    const profileId = '610ee6890a25e341708f1703';
    const req = getMockReq({
      body: { password: '5up3r53cur3' },
      user: {
        id: '610ee6890a25e341708f1984',
        username: 'testDev001',
        userId: '610ee6890a25e341708f1784',
      },
      params: { userId: profileId },
    });

    // mocks
    UsersRepository.prototype.findById = jest.fn(async () => ({
      username,
      id: profileId,
    }));

    // Act
    const response = await authController.resetPassword(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 403,
      message: 'Forbidden',
      fields: [],
      payload: null,
      errorMessage: 'Cannot update another users password',
    });
  });

  test('When source user is not found, expect a 404 response', async () => {
    // Arrange
    const profileId = '610ee6890a25e341708f1703';
    const req = getMockReq({
      body: { password: '5up3r53cur3' },
      user: {
        id: '610ee6890a25e341708f1984',
        username: 'testDev001',
        userId: profileId,
      },
      params: { userId: profileId },
    });

    // mocks
    UsersRepository.prototype.findById = jest.fn(async () => null);

    // Act
    const response = await authController.resetPassword(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 404,
      message: 'Not_Found',
      fields: [],
      payload: null,
      errorMessage: 'User is not found',
    });
  });

  test('When provided password is invalid, expect a 400 response', async () => {
    // Arrange
    const password = [];
    const profileId = '610ee6890a25e341708f1703';
    const req = getMockReq({
      body: { password },
      user: {
        id: '610ee6890a25e341708f1984',
        username: 'testDev001',
        userId: '610ee6890a25e341708f1784',
      },
      params: { userId: profileId },
    });

    // Act
    const response = await authController.resetPassword(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      fields: [
        `Field 'password' expected to be nonEmptyString. Got: ${password}`,
      ],
      payload: null,
      errorMessage: 'Validation errors',
    });
  });

  test('When provided userId is invalid, expect a 400 response', async () => {
    // Arrange
    const userId = 6101703;
    const req = getMockReq({
      body: { password: 'password!' },
      user: {
        id: '610ee6890a25e341708f1984',
        username: 'testDev001',
        userId: '610ee6890a25e341708f1784',
      },
      params: { userId },
    });

    // Act
    const response = await authController.resetPassword(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Bad_Request',
      fields: [
        `Field 'userId' expected to be nonEmptyString. Got: ${userId}`,
        `Field 'userId' expected to be GUID. Got: ${userId}`,
      ],
      payload: null,
      errorMessage: 'Validation errors',
    });
  });
});
