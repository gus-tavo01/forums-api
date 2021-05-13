module.exports = (topics) => {
  const result = { ...topics };
  result.docs = topics.docs.map((topic) => ({
    id: topic._id,
    name: topic.name,
    content: topic.content,
    createDate: topic.createDate,
    updateDate: topic.updateDate,
    forumId: topic.forumId,
    comments: topic.comments,
  }));
  return result;
};
