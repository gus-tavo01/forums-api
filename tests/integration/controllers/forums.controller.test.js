require('dotenv').config();
const ForumsController = require('../../../controllers/Forums.Controller');
const ForumsRepository = require('../../../repositories/Forums.Repository');
// mocks
const { getMockReq } = require('@jest-mock/express');
const { res, clearMockRes } = require('../../helpers/mockResponse')();
// setup
const database = require('../../../config/database');

// dependencies
let forumsController;
let forumsRepo;

//#region test setup
beforeAll(() => {
  jest.setTimeout(5 * 60 * 1000);
  database.connect();
  forumsController = new ForumsController();
  forumsRepo = new ForumsRepository();
});

afterAll(() => {
  database.disconnect();
});

afterEach(() => {
  clearMockRes();
});
//#endregion test setup

describe('Forums Controller', () => {
  test('When forum data is valid, expect to be success', async () => {
    // Arrange
    const req = getMockReq({
      body: { topic: 'Nope', description: 'No description', isPrivate: true },
      user: { username: 'ticky' },
    });

    // Act
    const response = await forumsController.post(req, res);

    // test clean up
    try {
      const { payload } = response;
      await forumsRepo.remove(payload.id);
    } catch (err) {}

    // Assert
    expect(response).toMatchObject({
      statusCode: 201,
      message: 'Created',
      errorMessage: null,
      fields: [],
    });
  });
});
