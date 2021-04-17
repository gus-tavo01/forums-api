require('dotenv').config();
const mockResponse = require('../test-helpers/mockRes');
const { getMockReq } = require('@jest-mock/express');
const AuthController = require('../../../controllers/Auth.Controller');
const LoginsService = require('../../../services/Logins.Service');
const UsersService = require('../../../services/Users.Service');

jest.mock('../../../services/Logins.Service');
jest.mock('../../../services/Users.Service');

const { res, clearMockRes } = mockResponse();

describe('Auth controller login', () => {
  let authController = new AuthController();

  afterEach(() => {
    clearMockRes();
    LoginsService.prototype.findByUsername.mockReset();
  });

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
    const mockAccount = {
      fields: [],
      result: {
        username,
        passwordHash:
          '$2b$10$XDnIFdbz/R4qdLkhrAlco.LPJE2IlqdYOhKrprvGluBdS9vH.Ujzu',
      },
    };
    LoginsService.prototype.findByUsername = jest.fn(async () => mockAccount);

    const expectedStatusCode = 200;

    // Act
    await authController.login(req, res);

    // Assert
    expect(res.response).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.anything(),
        statusCode: expectedStatusCode,
      })
    );
  });

  // test('When username does not exist, expect a 401 response', async () => {});

  // test('When password is incorrect, expect a 401 response', async () => {});

  // test('When username is invalid, expect a 400 response', async () => {});

  // test('When an unhandled error, expect a 500 response', async () => {});
});

describe('Auth controller register', () => {
  let authController = new AuthController();

  afterEach(() => {
    clearMockRes();
    // mocks reset
  });

  test('When user data is valid, expect a successful response', async () => {
    // Arrange
    const username = 'paco.perez01';
    const email = 'pac.per@gmail.com';
    const dateOfBirth = Date.now();
    const password = 'abc123!!';
    const req = getMockReq({
      body: { username, email, dateOfBirth, password },
    });

    // mocks
    const serviceResponse = { fields: [] };
    const mockLogin = { ...serviceResponse, result: null };
    LoginsService.prototype.findByUsername = jest.fn(async () => mockLogin);
    const mockCreateLogin = {
      ...serviceResponse,
      result: {
        username,
      },
    };
    LoginsService.prototype.create = jest.fn(async () => mockCreateLogin);
    const mockAddUserAccount = {
      ...serviceResponse,
      result: { username, email, dateOfBirth },
    };
    UsersService.prototype.add = jest.fn(async () => mockAddUserAccount);

    // Act
    await authController.register(req, res);

    // Assert
    expect(res.response).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 201,
        payload: expect.anything(),
      })
    );
  });

  // for each param on body, do a test
  // 'When username is in use'
});

// describe('Auth controller resetPassword');
