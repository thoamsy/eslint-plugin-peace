const propName = (attribute) => {
  if (!attribute || !attribute.name) {
    return;
  }
  return attribute.name.name;
};

const getPropValueExpectIdentifier = (attribute) => {
  if (!attribute || !attribute.value || !attribute.value.expression) {
    return;
  }
  const { properties } = attribute.value.expression;
  // 如果 style 是一个变量 identifier，这个值也会为空
  if (!properties) {
    return;
  }

  return properties.reduce((value, property) => {
    const ide = 'Identifier';
    // 不考虑变量作为 key 的场景。另外 ...style 这种写法会导致 value
    if (!property.value || property.value.type === ide) {
      return value;
    }
    value[property.key.name] = property.value.value;
    return value;
  }, {});
};

const closetNodeFor = (node, type) => {
  const maxDepth = 5;
  let currentDepth = 0;

  while (currentDepth < maxDepth && node && node.type !== type) {
    node = node.parent;
    currentDepth += 1;
  }
  if (node && node.type === type) {
    return node;
  }
  return false;
};

module.exports = {
  propName,
  getPropValueExpectIdentifier,
  closetNodeFor,
};
