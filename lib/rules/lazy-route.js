const types = require('../util/types');

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: '没有 Lazy 的 Route 没有灵魂',
      recommended: true,
    },
  },
  create(context) {
    const componentMaybeRoutes = new Set();
    const specifierNode = new Map();
    const isLazy = new Set();
    let bailout = true;
    const needSemi = context.options.semi || true;

    return {
      CallExpression(node) {
        // 用来判断是不是 react-lazy 引入的代码
        if (node.parent.type === types.VariableDeclarator) {
          const { id } = node.parent;
          componentMaybeRoutes.delete(id.name);
          specifierNode.delete(id.name);
          isLazy.add(id.name);
        }
      },
      ImportDeclaration(node) {
        let hasReactRouter = false;
        if (node.source.value.startsWith('react-router-dom')) {
          hasReactRouter = true;
        }

        node.specifiers.forEach((specifier) => {
          const name = specifier.local.name;
          if (hasReactRouter && name === 'Route') {
            bailout = false;
          }

          specifierNode.set(name, {
            node,
            isDefault: specifier.type === types.ImportDefaultSpecifier,
          });
        });
      },
      JSXElement(node) {
        if (bailout) {
          return;
        }
        let componentName = node.openingElement.name.name;
        if (componentName === 'Route') {
          componentMaybeRoutes.add(
            ...(node.children || [])
              .filter((child) => child.type === types.JSXElement)
              .map((element) => element.openingElement.name.name)
              .filter((name) => !isLazy.has(name))
          );

          const routeComponentProps = node.openingElement.attributes.find(
            (attribute) => attribute.name.name === 'component'
          );

          componentName = routeComponentProps
            ? routeComponentProps.value.expression.name
            : '';

          if (componentName && !isLazy.has(componentName)) {
            componentMaybeRoutes.add(componentName);
          }
        }
        if (componentMaybeRoutes.has(componentName)) {
          context.report({
            node,
            message: `${componentName} 这里请使用 React.lazy`,
            fix(fixer) {
              const { node, isDefault } =
                specifierNode.get(componentName) || {};
              if (!node) {
                return;
              }
              const path = node.source.raw;

              let code = `const ${componentName} = React.lazy(() => import(${path})`;

              if (!isDefault) {
                code += `.then(module => ({default: module.${componentName} }))`;
              }

              // React.lazy 右边的括号
              code += ')';

              if (needSemi) {
                code += ';';
              }

              specifierNode.delete(componentName);
              componentMaybeRoutes.delete(componentName);
              isLazy.add(componentName);
              return fixer.replaceText(node, code);
            },
          });
        }
      },
    };
  },
};
