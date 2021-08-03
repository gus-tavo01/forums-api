module.exports = function (forumData) {
  return { 
    id: forumData.id,
    name: forumData.name,
    description: forumData.description,
    author: forumData.author,
    createDate: forumData.createDate,
    updateDate: forumData.updateDate,
    lastActivity: forumData.lastActivity,
    participants: forumData.participants,
    imageSrc: forumData.imageSrc,
    isPrivate: forumData.isPrivate,
  };
}