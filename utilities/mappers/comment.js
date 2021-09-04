module.exports = (commentData) => ({
  id: commentData.id,
  message: commentData.message,
  likes: commentData.likes,
  dislikes: commentData.dislikes,
  createDate: commentData.createDate,
  from: commentData.from,
  to: commentData.to,
  forumId: commentData.forumId,
});
