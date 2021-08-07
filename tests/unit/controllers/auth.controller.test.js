require('dotenv').config();
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const AuthController = require('../../../controllers/Auth.Controller');
// repos
const AccountsRepository = require('../../../repositories/Accounts.Repository');
const UsersRepository = require('../../../repositories/Users.Repository');

const LoginsService = require('../../../services/Logins.Service');
const UsersService = require('../../../services/Users.Service');

jest.mock('../../../repositories/Accounts.Repository');
jest.mock('../../../repositories/Users.Repository');

jest.mock('../../../services/Logins.Service');
jest.mock('../../../services/Users.Service');

const authController = new AuthController();

afterEach(() => {
  clearMockRes();
});

describe('Auth controller login', () => {
  let authController = new AuthController();

  afterEach(() => {
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
    const response = await authController.login(req, res);

    // Assert
    expect(response).toMatchObject({
      payload: expect.anything(),
      statusCode: expectedStatusCode,
    });
  });

  // test('When username does not exist, expect a 401 response', async () => {});

  // test('When password is incorrect, expect a 401 response', async () => {});

  // test('When username is invalid, expect a 400 response', async () => {});

  // test('When an unhandled error, expect a 500 response', async () => {});
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
  const authController = new AuthController();

  test('When password is provided, expect to be successful', async () => {
    // Arrange
    const username = 'r.joemon001';
    const mockUser = { username };
    const req = getMockReq({
      body: { password: '5up3r53cur3' },
      user: mockUser,
    });

    // mock calls
    const serviceResponse = { fields: [] };
    const mockGetUser = {
      ...serviceResponse,
      result: { username, id: '1245543355aasd' },
    };
    UsersService.prototype.getById = jest.fn(async () => mockGetUser);
    const mockUpdateUser = {
      ...serviceResponse,
      result: {
        username,
      },
    };
    LoginsService.prototype.update = jest.fn(async () => mockUpdateUser);

    // Act
    const response = await authController.resetPassword(req, res);

    // Assert
    expect(response).toMatchObject({ statusCode: 200 });
  });

  // test('When user in token is not the one in req params, expect a forbidden response');
  // test('When source user is not found, expect a 422 response');
  // test('When provided password is invalid, expect a 400 response');
});
