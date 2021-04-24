module.exports = (forums) => {
  const result = { ...forums };
  result.docs = forums.docs.map((forum) => ({
    id: forum.id,
    name: forum.name,
    description: forum.description,
    author: forum.author,
    createDate: forum.createDate,
    participants: forum.participants,
    lastActivity: forum.lastActivity,
    imageSrc: forum.imageSrc,
  }));
  return result;
};
