import {
  useState,
  useEffect,
  useCallback,
  html,
  cloneElement,
} from './preact-hooks-htm-render-to-string.js';

export function Link({href, children, ...props}) {
  return html`<a ...${props} href=${href} onClick=${(e) => {
    // ignores the navigation when clicked using right mouse button or
    // by holding a special modifier key: ctrl, command, win, alt, shift
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }
    e.preventDefault();
    history.pushState(0, 0, href);
  }}>${children}</a>`
}

// renders first child whose `path` matches urls
export const Router = ({url, children}) => {
  children = Array.isArray(children) ? children : [children];

  url.replace(/index.html$/,'');

  const handler = children.find(vnode => {
    // exact match of a string
    if (typeof vnode.props.path === 'string') {
      return url.replace(/^\//, '') === vnode.props.path ||
        url === vnode.props.path;
    }
    // match of a string
    return vnode.props.path.test(url.replace(/^\//, '')) ||
      // FIXME: special-casing '/\//.test('/')
      // think more about all the slash-in-the-beginning/index.html situation
      vnode.props.path.test(url);
  });
  return cloneElement(handler, handler.props);
};

export function useLocation(url) {
  // when pre-rendering, we just use the provided url
  if (url) {
    return [url, () => {}];
  }
  const [path, update] = useState(location.pathname);

  useEffect(() => {
    patchHistoryEvents();

    const events = ["popstate", "pushState", "replaceState"];
    const handler = () => update(location.pathname);

    events.map(e => addEventListener(e, handler));
    return () => events.map(e => removeEventListener(e, handler));
  }, []);

  // the 2nd argument of the `useLocation` return value is a function
  // that allows to perform a navigation.
  //
  // the function reference should stay the same between re-renders, so that
  // it can be passed down as an element prop without any performance concerns.
  const navigate = useCallback(
    (to, replace) => history[replace ? "replaceState" : "pushState"](0, 0, to),
    []
  );

  return [path, navigate];
};

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031

let patched = 0;

const patchHistoryEvents = () => {
  if (patched) return;

  ["pushState", "replaceState"].map(type => {
    const original = history[type];

    history[type] = function() {
      const result = original.apply(this, arguments);
      const event = new Event(type);
      event.arguments = arguments;

      dispatchEvent(event);
      return result;
    };
  });

  return (patched = 1);
};
