module.exports = (forumData) => ({
  id: forumData.id,
  topic: forumData.topic,
  description: forumData.description,
  author: forumData.author,
  createDate: forumData.createDate,
  updateDate: forumData.updateDate,
  lastActivity: forumData.lastActivity,
  participants: forumData.participants,
  imageSrc: forumData.imageSrc,
  isPrivate: forumData.isPrivate,
});
