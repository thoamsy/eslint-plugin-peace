const { RuleTester } = require('eslint');
const parserMap = require('./parserOptions');
const types = require('../../../lib/util/types');
const rule = require('../../../lib/rules/pluralize');

const ruleTester = new RuleTester();

const expectedError = (word, replaced) => ({
  message: `${word} 的应该改成 ${replaced}`,
  type: types.Identifier,
});

ruleTester.run('test rule', rule, {
  valid: [
    { code: 'list.map(item => console.log(item))' },
    { code: 'students.map(student => console.log(student))' },
    { code: 'tips.forEach((tip, i) => console.log(`Tip ${i}:` + tip));' },
    {
      code: 'tips.forEach(function (tip, i) { console.log(`Tip ${i}:` + tip) });',
    },
  ].map(parserMap),
  invalid: [
    // { code: 'list.map(item => console.log(item))' },
    {
      code: 'student.map(stu => console.log(stu))',
      errors: [
        expectedError('student', 'students'),
        expectedError('stu', 'student'),
      ],
      output: `students.map(student => console.log(student))`,
    },
  ].map(parserMap),
});
