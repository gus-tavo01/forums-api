module.exports = (data) => ({
  id: data.id,
  username: data.username,
  passwordHash: data.passwordHash,
  userId: data.userId,
  isActive: data.isActive,
  createDate: data.createDate,
  updateDate: data.updateDate,
});
