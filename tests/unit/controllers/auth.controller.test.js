require('dotenv').config();
const { getMockReq, getMockRes } = require('@jest-mock/express');
const AuthController = require('../../../controllers/Auth.Controller');
const LoginsService = require('../../../services/Logins.Service');

jest.mock('../../../services/Logins.Service');
jest.mock('../../../services/Users.Service');

const { res, clearMockRes } = getMockRes();
let authController;

describe('Auth controller Login', () => {
  beforeAll(() => {
    authController = new AuthController();
  });

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
    expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
  });

  // test('When username does not exist, expect a 401 response', async () => {});

  // test('When password is incorrect, expect a 401 response', async () => {});

  // test('When username is invalid, expect a 400 response', async () => {});

  // test('When an unhandled error, expect a 500 response', async () => {});
});
