const types = require('../util/types');

module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: '没有 Lazy 的 Route 没有灵魂',
      recommended: true,
    },
  },
  create(context) {
    const specifierNames = [];
    const componentMaybeRoutes = new Set();
    const specifierNode = new Map();
    let bailout = true;
    const needSemi = context.options.semi || true;

    return {
      // VariableDeclaration(node) {
      //   console.log(node.declarations[0].id.name);
      // },
      ImportExpression(node) {
        console.log(node.source.value);
      },
      ImportDeclaration(node) {
        let hasReactRouter = false;
        if (node.source.value.startsWith('react-router-dom')) {
          hasReactRouter = true;
        }

        node.specifiers.forEach((specifier) => {
          const name = specifier.local.name;
          if (name === 'DevAtomDebug') {
            console.log(node.specifiers.length);
          }
          if (hasReactRouter && name === 'Route') {
            bailout = false;
          }

          specifierNames.push(name);
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
            ...((node.children || [])
              .filter((child) => child.type === 'JSXElement')
              .map((element) => element.openingElement.name.name) || [])
          );

          const routeComponentProps = node.openingElement.attributes.find(
            (attribute) => attribute.name.name === 'component'
          );

          componentName = routeComponentProps
            ? routeComponentProps.value.expression.name
            : '';
          if (componentName) {
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
              return fixer.replaceText(node, code);
            },
          });
        }
      },
    };
  },
};
