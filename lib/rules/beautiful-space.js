const get = require('lodash.get');
const zip = require('lodash.zip');
const types = require('../util/types');

const testChineseAdjacentEnglish = /(([0-9a-zA-Z]+)(\p{sc=Han}+))|((\p{sc=Han}+)([0-9a-zA-Z]+))/gu;

const insertWhitespace = (str = '') => {
  if (!str.match(testChineseAdjacentEnglish)) {
    return str;
  }
  return insertWhitespace(
    str.replace(testChineseAdjacentEnglish, (...matches) => {
      // use regexp group replace the index
      return matches[2]
        ? matches[2] + ' ' + matches[3]
        : matches[5] + ' ' + matches[6];
    })
  );
};

const text = '(｀_´)ゞ Add an whitespace, please!';

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: text,
      recommended: true,
    },
    fixable: 'whitespace',
  },
  create(context) {
    const format = (node, path, fix) => {
      const rawValue = get(node, path);
      const shouldFix = !!rawValue.match(testChineseAdjacentEnglish);
      if (shouldFix) {
        context.report({
          node,
          message: text,
          fix(fixer) {
            return fix(fixer, rawValue);
          },
        });
      }
    };

    const fixSimapleLiteral = (node) => {
      if (typeof node.value !== 'string') {
        return;
      }
      format(node, 'raw', (fixer, rawValue) => {
        return fixer.replaceText(node, insertWhitespace(rawValue));
      });
    };
    return {
      Literal: fixSimapleLiteral,
      JSXText: fixSimapleLiteral,
      TemplateLiteral(literal) {
        if (typeof literal.quasis === 'undefined') {
          return;
        }
        if (Array.isArray(literal.expressions)) {
          if (
            literal.expressions.some(
              (expression) =>
                ![types.Identifier, types.Literal].includes(expression.type)
            )
          ) {
            return;
          }
        }

        const needToFixed = literal.quasis.some((quasi) => {
          const raw = get(quasi, 'value.raw');
          if (!raw) {
            return false;
          }
          return raw.match(testChineseAdjacentEnglish);
        });

        if (!needToFixed) {
          return;
        }

        const theString = zip(literal.quasis, literal.expressions).reduce(
          (str, [quasi, expression]) => {
            let expeStr = '';

            const addCurly = (str) => '${' + str + '}';

            if (expression) {
              switch (expression.type) {
                case types.Literal:
                  expeStr = addCurly(expression.value);
                  break;
                case types.Identifier:
                  expeStr = addCurly(expression.name);
                  break;
              }
            }
            return str + quasi.value.raw + expeStr;
          },
          ''
        );

        context.report({
          node: literal,
          message: text,
          fix(fixer) {
            return fixer.replaceText(
              literal,
              '`' + insertWhitespace(theString) + '`'
            );
          },
        });
      },
    };
  },
};
