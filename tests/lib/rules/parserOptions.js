const defaultParserOptions = {
  ecmaVersion: 2021,
  sourceType: 'module',
  ecmaFeatures: {
    experimentalObjectRestSpread: true,
    jsx: true,
  },
};

module.exports = function parserOptionsMapper({
  code,
  errors,
  options = [],
  parserOptions = {},
}) {
  return {
    code,
    errors,
    options,
    parserOptions: {
      ...defaultParserOptions,
      ...parserOptions,
    },
  };
};
