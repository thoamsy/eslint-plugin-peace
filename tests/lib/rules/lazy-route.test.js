const { RuleTester } = require('eslint');
const parserMap = require('./parserOptions');
const types = require('../../../lib/util/types');
const rule = require('../../../lib/rules/lazy-route');

const ruleTester = new RuleTester();

const expectedError = (componentName) => ({
  message: `${componentName} 这里请使用 React.lazy`,
  type: types.JSXElement,
});

ruleTester.run('test rule', rule, {
  valid: [
    {
      code: `'中文'`,
    },
  ].map(parserMap),
  invalid: [
    {
      code: `
      import React, { FC } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { DevIndex } from './DevIndex';
import { DevDetails } from './DevDetails';
import DevDetailEdit from './DevDetailEdit';
import { DevAtomDebug } from './DevAtomDebug';

export const isDev = process.env.NODE_ENV === 'development';

const AtomDevelop = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact>
        <DevIndex />
      </Route>
      <Route exact component={DevDetails} />
      <Route exact>
        <DevDetailEdit />
      </Route>
      <Route exact>
        <DevAtomDebug />
      </Route>
    </Switch>
  );
};

export default AtomDevelop;
`,
      errors: [
        expectedError('DevIndex'),
        expectedError('DevDetails'),
        expectedError('DevDetailEdit'),
        expectedError('DevAtomDebug'),
      ],
    },
    {
      code: `
      import React, { FC } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
// import { DevIndex } from './DevIndex';
// import { DevDetails } from './DevDetails';
import DevDetailEdit from './DevDetailEdit';

const DevAtomDebug = React.lazy(() => import('./DevAtomDebug').then(module => module.DevAtomDebug));

export const isDev = process.env.NODE_ENV === 'development';

const AtomDevelop = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact>
        <DevIndex />
      </Route>
      <Route exact component={DevDetails} />
      <Route exact>
        <DevDetailEdit />
      </Route>
      <Route exact>
        <DevAtomDebug />
      </Route>
    </Switch>
  );
};

export default AtomDevelop;
`,
      errors: [
        expectedError('DevIndex'),
        expectedError('DevDetails'),
        expectedError('DevDetailEdit'),
      ],
    },
  ].map(parserMap),
});
