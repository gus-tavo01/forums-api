require('dotenv').config();
const ForumsController = require('../../../controllers/Forums.Controller');
const ForumsRepository = require('../../../repositories/Forums.Repository');
// mocks
const { getMockReq } = require('@jest-mock/express');
const { res, clearMockRes } = require('../../unit/helpers/mockResponse')();
// setup
const database = require('../../../config/database');

// dependencies
let forumsController;
let forumsRepo;

//#region test setup
beforeAll(() => {
  jest.setTimeout(5 * 60 * 1000);
  forumsController = new ForumsController();
  forumsRepo = new ForumsRepository();
  database.connect();
});

afterAll(() => {
  database.disconnect();
});

afterEach(() => {
  clearMockRes();
});
//#endregion test setup

describe('Forums Controller', () => {
  test('When something, expect succeed', async () => {
    // Arrange
    const req = getMockReq({
      body: { name: 'Nope', description: 'No description', isPrivate: true },
      user: { username: 'ticky' },
    });

    // Act
    const response = await forumsController.post(req, res);

    // test clean up
    const { payload } = response;
    await forumsRepo.remove(payload.id);

    // Assert
    expect(response).toMatchObject({
      statusCode: 201,
      message: 'Created',
      errorMessage: null,
      fields: [],
    });
  });
});
