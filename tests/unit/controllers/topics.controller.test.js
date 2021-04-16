const TopicsController = require('../../../controllers/Topics.Controller');
const TopicsService = require('../../../services/Topics.Service');

jest.mock('../../../services/Topics.Service');

describe('Topics Controller POST', () => {
  test('When topic data is valid, expect to be success', async () => {
    // Arrange
    // Act
    // Assert
    expect('troll').toBe('troll');
  });

  // 'When forum is not found, expect a 422 response'
  // 'When forumId is invalid, expect a 400 response'
  // 'When topic data is invalid, expect a 422 response'
});
