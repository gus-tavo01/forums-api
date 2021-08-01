const { getMockRes } = require('@jest-mock/express');

module.exports = () => {
  const result = getMockRes();
  // eslint-disable-next-line no-undef
  result.res.response = jest.fn();
  return result;
};
