const { getMockRes } = require('@jest-mock/express');

module.exports = () => {
  const result = getMockRes();
  result.res.response = jest.fn();
  return result;
};
