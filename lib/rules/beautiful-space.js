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
    return {
      Literal(node) {
        const { value } = node;
        if (typeof value !== 'string') {
          return;
        }

        if (value.match(testChineseAdjacentEnglish)) {
          context.report({
            node,
            message: text,
            fix(fixer) {
              const formatted = insertWhitespace(node.value);
              return fixer.replaceText(node, `'${formatted}'`);
            },
          });
        }
      },
    };
  },
};
