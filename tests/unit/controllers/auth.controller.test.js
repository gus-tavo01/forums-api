require('dotenv').config();
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const AuthController = require('../../../controllers/Auth.Controller');

const AccountsRepository = require('../../../repositories/Accounts.Repository');
const UsersRepository = require('../../../repositories/Users.Repository');

const EmailService = require('../../../services/Email.Service');
const CloudinaryService = require('../../../services/Cloudinary.Service');

const mockImage = require('../../helpers/mockImageUrl');

jest.mock('../../../repositories/Accounts.Repository');
jest.mock('../../../repositories/Users.Repository');
jest.mock('../../../services/Email.Service');
jest.mock('../../../services/Cloudinary.Service');

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

  test('When username does not exist, expect a 401 response', async () => {
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
    AccountsRepository.prototype.findByUsername = jest.fn(async () => null);

    // Act
    const response = await authController.login(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Unauthorized',
      statusCode: 401,
      payload: null,
      errorMessage: 'Invalid credentials',
      fields: [],
    });
  });

  test('When password does not match, expect a 401 response', async () => {
    // Arrange
    const username = 'rs.joemon001';
    const password = 'incorrect one';
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
      message: 'Unauthorized',
      statusCode: 401,
      payload: null,
      errorMessage: 'Invalid credentials',
      fields: [],
    });
  });

  test('When an unhandled error occurs, expect a 500 response', async () => {
    // Arrange
    const errMe = 'Gg ..';
    const username = 'rs.joemon001';
    const password = 'incorrect one';
    const req = getMockReq({
      body: {
        username,
        password,
      },
    });

    // mocks
    AccountsRepository.prototype.findByUsername = jest.fn(async () => {
      throw new Error(errMe);
    });

    // Act
    const response = await authController.login(req, res);

    // Assert
    expect(response).toMatchObject({
      message: 'Internal_Server_Error',
      statusCode: 500,
      payload: null,
      errorMessage: errMe,
      fields: [],
    });
  });
});

describe('Auth controller register', () => {
  afterEach(() => {
    if (AccountsRepository.prototype.findByUsername) {
      AccountsRepository.prototype.findByUsername.mockReset();
    }
  });

  test('When user data is valid, expect a successful response', async () => {
    // Arrange
    const userId = 'ertuasd1344235sdf4';
    const username = 'paco.perez01';
    const req = getMockReq({
      body: {
        avatar: mockImage.url,
        username,
        email: 'pac.per@gmail.com',
        dateOfBirth: '2000-02-16',
        password: 'password!',
      },
    });

    // mocks
    AccountsRepository.prototype.findByUsername = jest.fn(async () => null);
    UsersRepository.prototype.find = jest.fn(async () => ({ docs: [] }));
    CloudinaryService.prototype.uploadImage = jest.fn(
      async () => 'mgvmzgcrdbr1oqly666b'
    );
    UsersRepository.prototype.add = jest.fn(async () => ({
      id: userId,
    }));
    AccountsRepository.prototype.add = jest.fn(async () => ({
      username,
    }));
    EmailService.prototype.send = jest.fn(async () => null);

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(EmailService.prototype.send).toHaveBeenCalled();
    expect(CloudinaryService.prototype.uploadImage).toHaveBeenCalled();
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
    UsersRepository.prototype.find = jest.fn(async () => ({ docs: [] }));

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 409,
      payload: null,
      message: 'Conflict',
    });
  });

  test('When the email is in use, expect a 409 http response', async () => {
    // Arrange
    const username = 'tickYayis';
    const req = getMockReq({
      body: {
        username,
        password: 'password!',
        email: 'tiktok@gmail.com',
        dateOfBirth: '2010-10-21',
      },
    });

    AccountsRepository.prototype.findByUsername = jest.fn(async () => null);
    UsersRepository.prototype.find = jest.fn(async () => ({
      docs: [
        {
          username,
        },
      ],
    }));

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 409,
      payload: null,
      message: 'Conflict',
    });
  });

  test('When username is invalid, expect a 400 response with validation errors', async () => {
    // Arrange
    const username = null;
    const req = getMockReq({
      body: {
        username,
        password: 'password!',
        email: 'yayi@gmail.com',
        dateOfBirth: '2010-10-21',
      },
    });

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      payload: null,
      message: 'Bad_Request',
      fields: [
        `Field 'username' expected to be nonEmptyString. Got: ${username}`,
      ],
      errorMessage: 'Validation errors',
    });
  });

  test('When email is invalid, expect a 400 response with validation errors', async () => {
    // Arrange
    const email = 'GG';
    const req = getMockReq({
      body: {
        username: 'GG',
        password: 'password!',
        email,
        dateOfBirth: '2010-10-21',
      },
    });

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      payload: null,
      message: 'Bad_Request',
      fields: [`Field 'email' expected to be email. Got: ${email}`],
      errorMessage: 'Validation errors',
    });
  });

  test('When password is invalid, expect a 400 response with validation errors', async () => {
    // Arrange
    const password = {};
    const req = getMockReq({
      body: {
        username: 'GG',
        password,
        email: 'gustavoa.loera02@gmail.com',
        dateOfBirth: '2010-10-21',
      },
    });

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      payload: null,
      message: 'Bad_Request',
      fields: [
        `Field 'password' expected to be nonEmptyString. Got: ${password}`,
      ],
      errorMessage: 'Validation errors',
    });
  });

  test('When dateOfBirth is invalid, expect a 400 response with validation errors', async () => {
    // Arrange
    const dateOfBirth = 'GG';
    const req = getMockReq({
      body: {
        username: 'GG',
        password: 'password!',
        email: 'gg@gmail.com',
        dateOfBirth,
      },
    });

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 400,
      payload: null,
      message: 'Bad_Request',
      fields: [`Field 'dateOfBirth' expected to be Date. Got: ${dateOfBirth}`],
      errorMessage: 'Validation errors',
    });
  });

  test('When create account fails, expect to rollback user profile', async () => {
    // Arrange
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
    UsersRepository.prototype.find = jest.fn(async () => ({ docs: [] }));
    UsersRepository.prototype.add = jest.fn(async () => ({
      id: 'ertuasd1344235sdf4',
    }));
    AccountsRepository.prototype.add = jest.fn(async () => null);
    UsersRepository.prototype.remove = jest.fn(async () => ({}));

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 422,
      message: 'Unprocessable_Entity',
      payload: null,
      errorMessage:
        'User account/profile cannot be created, please try again later',
      fields: [],
    });
  });

  test('When an exception occurs, expect a 500 server error', async () => {
    // Arrange
    const erre = 'This endpoint sucks';
    const username = 'lana.rd';
    const req = getMockReq({
      body: {
        username,
        password: 'password!',
        email: 'tiktok@gmail.com',
        dateOfBirth: '2010-10-21',
      },
    });

    UsersRepository.prototype.find = jest.fn(async () => ({ docs: [] }));
    AccountsRepository.prototype.findByUsername = jest.fn(async () => {
      throw new Error(erre);
    });

    // Act
    const response = await authController.register(req, res);

    // Assert
    expect(response).toMatchObject({
      statusCode: 500,
      payload: null,
      message: 'Internal_Server_Error',
      errorMessage: erre,
      fields: [],
    });
  });
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
    const password = null;
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
        `Field 'password', expected not to be empty. Got: ${password}`,
        `Field 'password', expected to have length {\"min\":3}. Got: ${password}`,
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
        `Field 'userId', expected not to be empty. Got: ${userId}`,
        `Field 'userId', expected to be a valid mongo id. Got: ${userId}`,
      ],
      payload: null,
      errorMessage: 'Validation errors',
    });
  });
});
