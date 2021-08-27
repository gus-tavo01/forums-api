module.exports = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  dateOfBirth: user.dateOfBirth,
  selfDescription: user.selfDescription,
  language: user.language,
  createDate: user.createDate,
  updateDate: user.updateDate,
});
