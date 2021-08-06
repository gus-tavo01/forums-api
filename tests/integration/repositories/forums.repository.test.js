require('dotenv').config();
const ForumsRepository = require('../../../repositories/Forums.Repository');
const database = require('../../../config/database');

let forumsRepo;

// setup DB
beforeAll(() => {
  database.connect();
  forumsRepo = new ForumsRepository();
});

afterAll(() => {
  database.disconnect();
});

describe('Forums Repository Find', () => {
  test('When filters are provided, expect to retrieve a list of forums', async () => {
    // Arrange
    const filters = { page: 1, pageSize: 5 };

    // Act
    const response = await forumsRepo.find(filters);

    // Assert
    expect(response).not.toBeNull();
    expect(response).toHaveProperty('docs');
  });
});

describe('Forums Repository Add', () => {
  test('When forum data is valid, expect to be created successfully', async () => {
    // Arrange
    const forumData = {
      topic: 'Integrated one',
      description: 'Added through integration test. Is temporal',
      author: 'Integration Test',
      isPrivate: false,
    };

    // Act
    const response = await forumsRepo.add(forumData);
    const foundForum = await forumsRepo.findById(response.id);

    // #region test clean up
    await forumsRepo.remove(response.id);
    // #endregion test clean up

    // Assert
    expect(forumsRepo.add).not.toThrow();
    expect(foundForum).toMatchObject(forumData);
  });
});

// remove

// update
