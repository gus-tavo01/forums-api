module.exports = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  dateOfBirth: user.dateOfBirth,
  selfDescription: user.selfDescription,
  createDate: user.createDate,
  updateDate: user.updateDate,
});
