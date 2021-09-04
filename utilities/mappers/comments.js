module.exports = (commentsData) => {
  const result = {
    ...commentsData,
    docs: commentsData.docs.map((comment) => ({
      id: comment.id,
      message: comment.message,
      from: comment.from,
      to: comment.to,
      createDate: comment.createDate,
      likes: comment.likes,
      dislikes: comment.dislikes,
      forumId: comment.forumId,
    })),
  };

  return result;
};
