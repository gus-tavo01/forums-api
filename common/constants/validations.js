module.exports = {
  isEmpty: (opts) => ({ validator: 'isEmpty', opts }),
  isBool: (opts) => ({ validator: 'isBool', opts }),
  isLength: (opts) => ({ validator: 'isLength', opts }),
  isMongoId: (opts) => ({ validator: 'isMongoId', opts }),
  isNumeric: (opts) => ({ validator: 'isNumeric', opts }),
  isEmail: (opts) => ({ validator: 'isEmail', opts }),
  isDate: (opts) => ({ validator: 'isDate', opts }),
  // isArray, isObject
};
