module.exports = (data) => {
  const result = { ...data };
  result.docs = data.docs.map((doc) => ({
    id: doc.id,
    username: doc.username,
    avatar: doc.avatar,
    forumId: doc.forumId,
    userId: doc.userId,
    lastActivity: doc.lastActivity,
    role: doc.role,
  }));
  return result;
};
