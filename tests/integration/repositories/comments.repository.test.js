require('dotenv').config();
const TopicsRepository = require('../../../repositories/Topics.Repository');
const CommentsRepository = require('../../../repositories/Comments.Repository');
const database = require('../../../config/database');

// test suite globals
let topicsRepo;
let commentsRepo;

beforeAll(() => {
  database.connect();
  topicsRepo = new TopicsRepository();
  commentsRepo = new CommentsRepository();
});

afterAll(() => {
  database.disconnect();
});

describe('Comments Repository', () => {
  test('Create a topic, add a comment, remove the comment, remove the topic, expect success', async () => {
    // Arrange
    // TODO -> create a forum first instead hardcoding one
    // const forum = {};
    // await forumsRepo.add(forum);

    const topic = {
      name: 'E2e comment flow',
      content: 'This is a test',
      forumId: '606fad8e9a264318c021dd05',
    };
    const { id: topicId } = await topicsRepo.add(topic);

    const comment1 = {
      topicId,
      from: 'ticky',
      message: 'Huele a caca podrida',
    };
    const comment2 = {
      topicId,
      from: 'yayis',
      message: 'Yo no',
    };
    const expectedComments = 2;

    // Act
    const addedComments = await Promise.all([
      commentsRepo.add(comment1),
      commentsRepo.add(comment2),
    ]);

    const topicComments = await commentsRepo.find({ topicId });

    //#region Test clean up
    await Promise.all(addedComments.map((c) => commentsRepo.remove(c.id)));

    await topicsRepo.remove(topicId);
    // TODO -> await forumsRepo.remove(forumId);
    //#endregion test clean up

    // Assert
    expect(
      topicComments.docs.some(({ message }) => message === comment1.message)
    ).toBeTruthy();
    expect(
      topicComments.docs.some(({ message }) => message === comment2.message)
    ).toBeTruthy();
    expect(topicComments.docs.length).toBe(expectedComments);
  });
});
