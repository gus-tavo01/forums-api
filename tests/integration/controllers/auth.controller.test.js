require('dotenv').config();
const AuthController = require('../../../controllers/Auth.Controller');
const AccountsRepository = require('../../../repositories/Accounts.Repository');
// mocks
const { getMockReq } = require('@jest-mock/express');
const { res, clearMockRes } = require('../../unit/helpers/mockResponse')();
// setup
const database = require('../../../config/database');

// dependencies
let authController;
let accountsRepo;

//#region test setup
beforeAll(() => {
  jest.setTimeout(5 * 60 * 1000);
  authController = new AuthController();
  accountsRepo = new AccountsRepository();
  database.connect();
});

afterAll(() => {
  database.disconnect();
});

afterEach(() => {
  clearMockRes();
});
//#endregion test setup

describe('Auth Controller Register', () => {
  test('When account data is valid, expect to create an account', async () => {
    // Arrange
    const req = getMockReq({
      body: { username: 'neo', password: 'password!' },
    });

    // Act
    const response = await authController.post(req, res);

    // test clean up
    try {
      await accountsRepo.remove(response.id);
    } catch (err) {}

    // Assert
    expect(response).toMatchObject({
      statusCode: 201,
      fields: [],
      errorMessage: null,
      message: 'Created',
    });
  });
});
