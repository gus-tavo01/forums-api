module.exports = (forums) => {
  const result = { ...forums, };
  result.docs = forums.docs.map((forum) => ({
    id: forum.id,
    name: forum.name,
    description: forum.description,
    author: forum.author,
    createDate: forum.createDate,
    updateDate: forum.updateDate,
    participants: forum.participants,
    lastActivity: forum.lastActivity,
    imageSrc: forum.imageSrc,
    isPrivate: forum.isPrivate,
  }));
  return result;
};
