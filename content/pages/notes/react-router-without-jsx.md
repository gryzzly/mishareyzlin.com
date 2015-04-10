Date: 11 April 2015

# Creating routes with react-router without JSX, ES6 example

Here's a short example of how to define routes without using JSX and the nesting hierarchy when using React Router with ES6 syntax. 

```js
// this snippet was tested with react 0.13.1 and react-router 0.13.2
import Router from 'react-router';
import App    from './components/App';
import Inbox  from './components/Inbox';

const AppRoute = Router.createRoute({
  path: '/',
  name: 'app',
  handler: App
});

const InboxRoute = Router.createRoute({
  name: 'inbox',
  handler: Inbox,
  parentRoute: AppRoute
});

export default [AppRoute];
```

**Note**: you have to export the root route wrapped in array. 
