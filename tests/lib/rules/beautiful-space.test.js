const { RuleTester } = require('eslint');
const parserMap = require('./parserOptions');
const types = require('../../../lib/util/types');
const rule = require('../../../lib/rules/beautiful-space');

const ruleTester = new RuleTester();

const expectedError = (type = types.Literal) => ({
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
    {
      code:
        '`测试一下展示无法支持的模板字符串hhh ${33} ${() => { return 1; }}`',
    },
  ].map(parserMap),
  invalid: [
    { code: `'中文1'`, errors: [expectedError()] },
    { code: `'我们喜欢iPhone哦'`, errors: [expectedError()] },
    { code: `'iPhone哦'`, errors: [expectedError()] },
    { code: `'iPhone 好棒哦2030'`, errors: [expectedError()] },
    { code: `"iPhone 好棒哦2030"`, errors: [expectedError()] },
    { code: `"iOS和Android是两个操作系统"`, errors: [expectedError()] },
    {
      code: `const el = <div>这还是一个iPhone</div>`,
      errors: [expectedError(types.JSXText)],
    },
    {
      code: '`测试i下templatestring`',
      errors: [expectedError(types.TemplateLiteral)],
    },
    {
      code: '`iOS和Android都是操作系统, ${foo} 234厉害`',
      errors: [expectedError(types.TemplateLiteral)],
    },
  ].map(parserMap),
});
