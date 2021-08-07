require('dotenv').config();
const AuthController = require('../../../controllers/Auth.Controller');
const AccountsRepository = require('../../../repositories/Accounts.Repository');
const UsersRepository = require('../../../repositories/Users.Repository');
// mocks
const { getMockReq } = require('@jest-mock/express');
const { res, clearMockRes } = require('../../helpers/mockResponse')();
// setup
const database = require('../../../config/database');

// dependencies
let authController;
let accountsRepo;
let usersRepo;

//#region test setup
beforeAll(() => {
  jest.setTimeout(5 * 60 * 1000);
  database.connect();
  authController = new AuthController();
  accountsRepo = new AccountsRepository();
  usersRepo = new UsersRepository();
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
    const username = 'neo';
    const req = getMockReq({
      body: {
        username,
        password: 'password!',
        email: 'neo.geo@gmail.com',
        dateOfBirth: '2021-08-07',
      },
    });

    // Act
    const response = await authController.register(req, res);

    // test clean up
    try {
      const account = await accountsRepo.findByUsername(username);
      await Promise.all([
        await accountsRepo.remove(account.id),
        await usersRepo.remove(account.userId),
      ]);
    } catch (err) {}

    // Assert
    expect(response).toMatchObject({
      statusCode: 201,
      fields: [],
      errorMessage: null,
      message: 'Created',
      payload: username,
    });
  });
});
