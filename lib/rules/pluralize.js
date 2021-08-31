const types = require('../util/types');
const pluralize = require('pluralize');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '查找数组遍历方法中，不正确的单复数命名规范并修复。比如 `students.map(student => xxx)`',
      recommended: true,
    },
    fixable: 'code',
  },
  create(context) {
    const checkMethods = new Set([
      'map',
      'forEach',
      'reduce',
      'every',
      'some',
      'find',
      'findIndex',
      'filter',
    ]);
    const uncheckObjectName = new Set(['list', 'data']);

    return {
      'CallExpression MemberExpression': (node) => {
        const { object: listNode, property: listMethod } = node;
        // 如果不是指定的方法名字，或者单词长度小于 4 就跳过。
        if (
          !checkMethods.has(listMethod.name) ||
          uncheckObjectName.has(listNode.name) ||
          listNode.name.length < 4
        ) {
          return;
        }
        const plurayMethod = pluralize.plural(listNode.name);
        if (plurayMethod !== listNode.name) {
          context.report({
            node: listNode,
            message: `${listNode.name} 的应该改成 ${plurayMethod}`,
            fix(fixer) {
              return fixer.replaceText(listNode, plurayMethod);
            },
          });
        }

        const { arguments: args } = node.parent;
        if (args.length !== 1) {
          return;
        }
        const { type, params } = args[0];

        if (
          type !== types.ArrowFunctionExpression &&
          type !== types.FunctionExpression
        ) {
          return;
        }
        if (!params || params.length === 0) {
          return;
        }

        const iterName = params[0].name;
        const singularMethod = pluralize.singular(plurayMethod);
        if (iterName === singularMethod) {
          return;
        }

        // TODO: fix 整个 function 而不仅仅只是 params
        context.report({
          node: params[0],
          message: `${iterName} 的应该改成 ${singularMethod}`,
          fix(fixer) {
            return fixer.replaceText(params[0], singularMethod);
          },
        });
      },
    };
  },
};
