Date: 11 April 2015

# Define react-router routes without JSX

Short React Router example of how to define routes and routes hierarchy without using JSX. The example is using ES6 syntax.

	// this snippet was tested with react 0.13.1 
	// and react-router 0.13.2
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

	// Important: you have to export the root route wrapped in array 
	export default [AppRoute];
