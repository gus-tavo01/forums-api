require('dotenv').config();
const ForumsRepository = require('../../../repositories/Forums.Repository');
const setupDb = require('../../../config/database');

// setup DB
beforeAll(() => {
  setupDb();
});

describe('Forums Repository Find', () => {
  test('When filters are provided, expect to retrieve a list of forums', async () => {
    // Arrange
    const repo = new ForumsRepository();
    const filters = { page: 1, pageSize: 5 };

    // Act
    const response = await repo.find(filters);

    // Assert
    expect(response).not.toBeNull();
    expect(response).toHaveProperty('docs');
  });
});
