const { RuleTester } = require('eslint');
const parserMap = require('./parserOptions');
const rule = require('../../../lib/rules/beautiful-space');

const ruleTester = new RuleTester();

const expectedError = (type = 'Literal') => ({
  message: '(｀_´)ゞ Add an whitespace, please!',
  type,
});

ruleTester.run('test rule', rule, {
  valid: [
    {
      code: `'中文'`,
    },
    {
      code: `'中文 1'`,
    },
    {
      code: `'我们喜欢 iPhone 哦'`,
    },
  ].map(parserMap),
  invalid: [
    { code: `'中文1'`, errors: [expectedError()] },
    { code: `'我们喜欢iPhone哦'`, errors: [expectedError()] },
    { code: `'iPhone哦'`, errors: [expectedError()] },
    { code: `'iPhone 好棒哦2030'`, errors: [expectedError()] },
  ].map(parserMap),
});
