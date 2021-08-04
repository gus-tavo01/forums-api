require('dotenv').config();
const TopicsRepository = require('../../../repositories/Topics.Repository');
const database = require('../../../config/database');

// setup DB
beforeAll(() => {
  database.disconnect();
});

describe('Topics Repository find', () => {
  test('When filters are op, expect to retrieve a paginated result', async () => {
    // Arrange
    const topicsRepository = new TopicsRepository();
    const filters = {};

    // Act
    const result = await topicsRepository.find(filters);

    // Assert
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('docs');
  });
});

describe('Topics Repository E2e workflow', () => {
  test('When create a topic, expect to be successful', async () => {
    // Arrange
    const topicsRepo = new TopicsRepository();
    const topicData = {
      name: 'End to end name :p',
      content: 'This is a temporal topic lol',
      forumId: '606fad8e9a264318c021dd05',
    };

    // Act
    const resultCreateTopic = await topicsRepo.add(topicData);

    // Assert
    expect(resultCreateTopic).not.toBeNull();

    // Act
    const resultGetTopic = await topicsRepo.findById(resultCreateTopic.id);

    // Assert
    expect(resultGetTopic).not.toBeNull();

    // TODO
    // modify topic

    // Act
    const removeTopic = await topicsRepo.remove(resultGetTopic.id);
    const getRemovedTopic = await topicsRepo.findById(removeTopic.id);

    // Asert
    expect(getRemovedTopic).toBeNull();
  });
});
