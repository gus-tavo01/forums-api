module.exports = (data) => {
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    passwordHash: data.passwordHash,
    isActive: data.isActive,
    createDate: data.createDate,
    updateDate: data.updateDate,
  };
};
