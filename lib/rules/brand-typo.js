const types = require('../util/types');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description:
        '用来检测品牌名字是否存在拼写问题，比如 TikTok 而不是 Tiktok；iOS 而不是 ios，Android 而不是 android',
      recommended: true,
    },
    fixable: 'whitespace',
  },
  create(context) {
    let brandChecklist = Array.isArray(context.options[0])
      ? context.options[0]
      : context.options;

    if (!brandChecklist) {
      return;
    }
    // convert to an array
    brandChecklist = [].concat(brandChecklist);

    const checklistMap = new Map(
      brandChecklist.map((word) => [word.toLowerCase(), word])
    );
    const regexp = new RegExp(`\\b(${brandChecklist.join('|')})\\b`, 'ig');

    function figureOutTypo(node) {
      if (typeof node.value !== 'string') {
        return;
      }
      const matched = node.value.match(regexp);

      if (!matched || matched.every((word) => brandChecklist.includes(word))) {
        return;
      }

      context.report({
        node,
        message: 'Your got a typo for your brand',
        fix(fixer) {
          const wrap = node.type === types.Literal ? "'" : '';
          return fixer.replaceText(
            node,
            wrap +
              node.value.replace(regexp, (found) => {
                return checklistMap.get(found.toLowerCase());
              }) +
              wrap
          );
        },
      });
    }
    return {
      Literal: figureOutTypo,
      JSXText: figureOutTypo,
      // TODO: 摸板字符串以后再支持
    };
  },
};
