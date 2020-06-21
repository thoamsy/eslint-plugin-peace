/**
 * @fileoverview some rules in bytedance devops group
 * @author devops
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var requireIndex = require('requireindex');

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
const rules = (module.exports.rules = requireIndex(__dirname + '/rules'));

// import processors
module.exports.processors = {
  // add your processors here
};

module.exports.configs = {
  recommended: {
    plugins: ['peace'],
    rules: Object.entries(rules).reduce((result, [name, rule]) => {
      if (rule.meta.docs.recommended) {
        result[name] = 2;
      }
      return result;
    }, {}),
  },
};
