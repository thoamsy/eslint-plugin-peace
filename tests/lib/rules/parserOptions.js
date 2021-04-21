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
  output,
}) {
  return {
    code,
    errors,
    options,
    output,
    parserOptions: {
      ...defaultParserOptions,
      ...parserOptions,
    },
  };
};
