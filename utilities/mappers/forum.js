module.exports = (forumData) => ({
  id: forumData.id,
  topic: forumData.topic,
  description: forumData.description,
  author: forumData.author,
  createDate: forumData.createDate,
  updateDate: forumData.updateDate,
  lastActivity: forumData.lastActivity,
  participants: forumData.participants,
  image: forumData.image,
  isPrivate: forumData.isPrivate,
  isActive: forumData.isActive,
  comments: forumData.comments,
});
