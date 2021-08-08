module.exports = (data) => {
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    avatar: data.avatar,
    forumId: data.forumId,
    userId: data.userId,
    lastActivity: data.lastActivity,
    role: data.role,
  };
};
