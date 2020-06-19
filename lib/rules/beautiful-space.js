const get = require('lodash.get');
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
      // 模板字符串有点奇怪，引号会丢失。可能要考虑自己去解析一个 模板字符串的 AST 来重新构建
      /*       TemplateLiteral(literal) {
        if (typeof literal.quasis === 'undefined') {
          return;
        }

        literal.quasis.some((quasi) => {
          const raw = get(quasi, 'value.raw');
          if (!raw) {
            return;
          }
          if (raw.match(testChineseAdjacentEnglish)) {
            context.report({
              node: literal,
              message: text,
              *fix(fixer) {
                for (const quasi of literal.quasis) {
                  if (quasi.value.raw.match(testChineseAdjacentEnglish)) {
                    yield fixer.replaceTextRange(
                      quasi.range,
                      insertWhitespace(`"${quasi.value.raw}"`)
                    );
                  }
                }
              },
            });
          }
        });
      }, */
    };
  },
};
