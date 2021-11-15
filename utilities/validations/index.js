const string = require('./string');
const number = require('./number');
const bool = require('./bool');
const common = require('./common');

// deprecated validations
const isEmpty = require('./isEmpty');
const isBool = require('./isBool');
const isLength = require('./isLength');
const isMongoId = require('./isMongoId');
const isNumeric = require('./isNumeric');
const isEmail = require('./isEmail');
const isDate = require('./isDate');

module.exports = {
  string,
  number,
  common,
  bool,
  // TODO: segment those validatios per data type
  // date, (greaterThan(dateToCompare), lessThan(dateToCompare), equalTo(dateToCompare))

  isEmpty,
  isBool,
  isLength,
  isMongoId,
  isNumeric,
  isEmail,
  isDate,
};
