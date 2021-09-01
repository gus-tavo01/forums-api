require('dotenv').config();
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const { getMockReq } = require('@jest-mock/express');
const UsersController = require('../../../controllers/Users.Controller');
const UsersRepository = require('../../../repositories/Users.Repository');

jest.mock('../../../repositories/Users.Repository');

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

// describe('Users Controller GetForums' , () => {
//   test('When public filter is invalid, expect a validation error', async () => {});
// });
