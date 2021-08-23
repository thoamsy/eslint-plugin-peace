const { RuleTester } = require('eslint');
const parserMap = require('./parserOptions');
const types = require('../../../lib/util/types');
const rule = require('../../../lib/rules/brand-typo');

const ruleTester = new RuleTester();

const expectedError = (type = types.Literal) => ({
  message: 'Your got a typo for your brand',
  type,
});

ruleTester.run('test rule', rule, {
  valid: [
    {
      code: `const str = 'TikTok'`,
      options: ['TikTok'],
    },
    {
      code: `if (true) { str = 'TikTok' } else { str = 'douyin' }`,
      options: ['TikTok'],
    },
    {
      code: `<div>Call me in TikTok</div>`,
      options: ['TikTok'],
    },
  ].map(parserMap),
  invalid: [
    {
      code: `const str = 'Tiktok'`,
      errors: [expectedError()],
      output: `const str = 'TikTok'`,
      options: ['TikTok'],
    },
    {
      code: `if (true) { str = 'tiktok' }`,
      errors: [expectedError()],
      output: `if (true) { str = 'TikTok' }`,
      options: ['TikTok'],
    },
    {
      code: `<div>call me in tiktok</div>`,
      errors: [expectedError(types.JSXText)],
      output: `<div>call me in TikTok</div>`,
      options: ['TikTok'],
    },
    {
      code: `'请问你是ios手机还是android手机'`,
      errors: [expectedError()],
      output: `'请问你是iOS手机还是Android手机'`,
      options: ['iOS', 'Android'],
    },
    {
      errors: [expectedError()],
      code: `'请问你是iOS手机还是Android手机'`,
      output: `'请问你是ios手机还是android手机'`,
      options: [['ios', 'android']],
    },
  ].map(parserMap),
});
