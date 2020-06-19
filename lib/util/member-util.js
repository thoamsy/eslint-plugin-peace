const types = require('../util/types');
const TYPE = 'MemberExpression';
const combineMemberName = (callExpression, name = []) => {
  if (callExpression.type === TYPE) {
    name.unshift(callExpression.property.name);
    return combineMemberName(callExpression.object, name);
  }
  name.unshift(callExpression.name);
  return name.join('.');
};

// const constructMemberExpression = (expression = '') => {
//   const list = expression.split('.');
//   if (list.length === 1) {
//     return
//   }
//   const _construct = (lessExpression) => {

//   }
// }
const getFunctionName = (node) => {
  const { callee } = node;

  const callName =
    callee.type === 'MemberExpression'
      ? combineMemberName(callee)
      : callee.name;
  return callName;
};

const isJSXText = (node) =>
  node.type === types.Literal || node.type === types.JSXText;

const isOnelineArrowFunction = (node) =>
  node.type === types.ArrowFunctionExpression && !Array.isArray(node.body);

module.exports = {
  combineMemberName,
  getFunctionName,
  isJSXText,
  isOnelineArrowFunction,
};
