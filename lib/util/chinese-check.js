const get = require('lodash.get');
const {
  isJSXText,
  isOnelineArrowFunction,
  getFunctionName,
} = require('./member-util');
const { closetNodeFor } = require('./selector');
const types = require('./types');

const containChineseText = (str = '') =>
  typeof str === 'string' ? /\p{sc=Han}/u.test(str) : false;

const errorText = '不允许出现单独的中文字面量';

const createChecker = (context) => (isJSX) => {
  function* fixable(fixer, replaceFunctionName, node) {
    const insertFunction = (originValue = '') => {
      const inserted = originValue
        .replace(/^['"]|['"]$/, '')
        .replace(
          /^(\s*)([^\s]+)(\s*)$/,
          `$1${isJSX ? '{' : ''}${replaceFunctionName}('$2')${
            isJSX ? '}' : ''
          }$3`
        );

      return inserted;
    };

    if (isJSXText(node)) {
      yield fixer.replaceTextRange(node.range, insertFunction(node.value));
    }

    if (node.type === types.CallExpression) {
      // 插入白名单配置的函数
      for (const argument of node.arguments) {
        if (argument.type === types.Literal) {
          yield fixer.replaceTextRange(
            argument.range,
            insertFunction(argument.value)
          );
        }
      }
    }

    if (node.type === types.JSXElement) {
      for (const child of node.children) {
        if (isJSXText(child)) {
          yield fixer.replaceTextRange(
            child.range,
            insertFunction(child.value)
          );
        }
      }
    }
  }

  const checkNodeContainChinese = (node, path) => {
    let transformNode = path ? get(node, path) : node;
    if (!transformNode) {
      return false;
    }

    if (isJSXText(transformNode)) {
      const hasChinese = containChineseText(transformNode.value);
      if (!hasChinese) {
        return;
      }

      return context.report({
        node: transformNode,
        message: errorText,
        suggest: [
          {
            desc: '请使用你们项目中的国际化函数替换中文字符串',
            fix(fixer) {
              const replaceFunctionName = get(
                context.options,
                '[0].whitelist[0]'
              );
              if (!replaceFunctionName) {
                return;
              }

              return fixable(fixer, replaceFunctionName, transformNode, isJSX);
            },
          },
        ],
      });
    }

    if (transformNode.type === types.Property) {
      return checkNodeContainChinese(transformNode.value);
    }

    if (isOnelineArrowFunction(transformNode)) {
      return checkNodeContainChinese(transformNode.body);
    }

    if (transformNode.type === types.JSXExpressionContainer) {
      return checkNodeContainChinese(transformNode.expression);
    }
    if (transformNode.type === types.ObjectExpression) {
      return checkNodes(transformNode.properties);
    }
    if (transformNode.type === types.ArrayExpression) {
      return checkNodes(transformNode.elements);
    }
  };

  const checkNodes = (nodes, path) => {
    if (!Array.isArray(nodes)) {
      return checkNodeContainChinese(nodes, path);
    }
    return nodes.some((node) => checkNodeContainChinese(node, path));
  };

  return checkNodes;
};

const bailoutIfInWhitelist = (context) => {
  const optionNames = new Set(
    [].concat(get(context.options, '[0].whitelist', ''))
  );

  return (literal) => {
    const callExperssion = closetNodeFor(literal, types.CallExpression);

    if (callExperssion) {
      const name = getFunctionName(callExperssion);
      if (optionNames.has(name)) {
        return true;
      }
    }
  };
};

const meta = {
  type: 'suggestion',
  fixable: 'code',
  docs: {
    description: '为了全面支持 i18n，将不再允许中文字符串字面量的出现',
  },
};

module.exports = {
  meta,
  createChecker,
  bailoutIfInWhitelist,
};
