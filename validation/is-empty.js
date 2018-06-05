const isEmpty = value => {
  // Return true if passed value is undefined, null, empty object, or empty string
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  );
}

module.exports = isEmpty;
