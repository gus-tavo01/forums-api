module.exports = (forums) => {
  const result = { ...forums };
  result.docs = forums.docs.map((forum) => ({
    id: forum.id,
    topic: forum.topic,
    description: forum.description,
    author: forum.author,
    createDate: forum.createDate,
    updateDate: forum.updateDate,
    participants: forum.participants,
    lastActivity: forum.lastActivity,
    image: forum.image,
    isPrivate: forum.isPrivate,
    isActive: forum.isActive,
  }));
  return result;
};
