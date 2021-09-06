require('dotenv').config();
const UsersController = require('../../../controllers/Users.Controller');
// #region setup
const { getMockReq } = require('@jest-mock/express');
const { res, clearMockRes } = require('../../helpers/mockResponse')();
const database = require('../../../config/database');
// #endregion setup

let usersController;

//#region test setup
beforeAll(() => {
  jest.setTimeout(5 * 60 * 1000);
  database.connect();

  usersController = new UsersController();
});

afterAll(() => {
  database.disconnect();
});

afterEach(() => {
  clearMockRes();
});
//#endregion test setup

describe('Users Controller GetUserForums', () => {
  test('When private forums are requested, expect user to be participant', async () => {
    // Arrange
    const req = getMockReq({
      query: {
        public: 'false',
      },
      params: { id: '612ecfccd7528c4e2af06fc1' },
      user: { username: 'gus-tavo01' },
    });

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(
      response.payload.docs.every((f) => f.isPrivate === true)
    ).toBeTruthy();
  });

  test('When public forums are requested, expect public forums to be retrieved ONLY', async () => {
    // Arrange
    const req = getMockReq({
      query: {
        public: 'true',
      },
      params: { id: '612ecfccd7528c4e2af06fc1' },
      user: { username: 'gus-tavo01' },
    });

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    expect(
      response.payload.docs.some((f) => f.isPrivate === true)
    ).not.toBeTruthy();
  });

  test('When author and private filters are provided, expect user to be participant', async () => {
    // Arrange
    const requestor = 'ticky01';
    const req = getMockReq({
      query: {
        public: 'false',
        author: 'yayis01',
      },
      params: { id: '612ec5548a8aa445f244ac8d' },
      user: { username: requestor },
    });

    // Act
    const response = await usersController.getUserForums(req, res);

    // Assert
    const {
      payload: { docs: forums },
    } = response;
    expect(forums.every((f) => f.isPrivate === true)).toBeTruthy();
    expect(forums.some((f) => f.author !== requestor)).toBeTruthy();
  });
});
