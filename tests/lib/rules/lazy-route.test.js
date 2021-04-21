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
      code: `import React, { FC } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
const DevIndex = React.lazy(() =>
  import('./DevIndex').then((module) => ({ default: module.DevIndex }))
);
const DevDetails = React.lazy(() =>
  import('./DevDetails').then((module) => ({ default: module.DevDetails }))
);
const DevDetailEdit = React.lazy(() => import('./DevDetailEdit'));
const DevAtomDebug = React.lazy(() =>
  import('./DevAtomDebug').then((module) => ({ default: module.DevAtomDebug }))
);

export const isDev = process.env.NODE_ENV === 'development';

const AtomDevelop = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route  exact>
        <DevIndex />
      </Route>
      <Route  exact>
        <DevDetails />
      </Route>
      <Route  exact>
        <DevDetailEdit />
      </Route>
      <Route  exact>
        <DevAtomDebug />
      </Route>
    </Switch>
  );
};

export default AtomDevelop;
`,
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
      output: `
import React, { FC } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
const DevIndex = React.lazy(() => import('./DevIndex').then(module => ({default: module.DevIndex })));
const DevDetails = React.lazy(() => import('./DevDetails').then(module => ({default: module.DevDetails })));
const DevDetailEdit = React.lazy(() => import('./DevDetailEdit'));
const DevAtomDebug = React.lazy(() => import('./DevAtomDebug').then(module => ({default: module.DevAtomDebug })));

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
    },
    {
      code: `
import React, { FC } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { DevIndex } from './DevIndex';
import { DevDetails } from './DevDetails';

const DevAtomDebug = React.lazy(() => import('./DevAtomDebug').then(module => module.DevAtomDebug));
const DevDetailEdit = React.lazy(() => import('./DevDetailEdit'));

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
      errors: [expectedError('DevIndex'), expectedError('DevDetails')],
      output: `
import React, { FC } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
const DevIndex = React.lazy(() => import('./DevIndex').then(module => ({default: module.DevIndex })));
const DevDetails = React.lazy(() => import('./DevDetails').then(module => ({default: module.DevDetails })));

const DevAtomDebug = React.lazy(() => import('./DevAtomDebug').then(module => module.DevAtomDebug));
const DevDetailEdit = React.lazy(() => import('./DevDetailEdit'));

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
    },
  ].map(parserMap),
});
