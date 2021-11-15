module.exports = {
  isOneOf: (prop, value, collection, compare = undefined) => ({
    validation: 'isOneOf',
    property: prop,
    onFailureMessage: `Field '${prop}', expected to be in ${JSON.stringify(
      collection
    )}. Got: ${value}`,
    execute: () => {
      const handler = (v) => v === value;
      return collection.some(compare || handler);
    },
  }),
};
