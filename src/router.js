import {
  useState,
  useEffect,
  useCallback,
  html,
  cloneElement,
} from './preact-hooks-htm-render-to-string.js';

function isExternalLink(a) {
  return (a.host !== window.location.host);
}

const onLinkClick = (href) => (e) => {
  // ignores the navigation when clicked using right mouse button or
  // by holding a special modifier key: ctrl, command, win, alt, shift
  if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.shiftKey ||
    e.button !== 0
  ) {
    return;
  }
  e.preventDefault();
  history.pushState(0, 0, href);
};

export function Link({href, children, ...props}) {
  return html`<a ...${props} href=${href} onClick=${onLinkClick(href)}>${children}</a>`
}

// renders first child whose `path` matches urls
export const Router = ({url, children}) => {
  children = Array.isArray(children) ? children : [children];

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', function (e) {
        let closest;
        // `closest` will return element itself if it matches the selector
        if ((closest = e.target.closest('a')) && !e.defaultPrevented) {
          if (!isExternalLink(closest)) {
            onLinkClick(closest.href)(e);
          }
        }
      });
    }
  }, []);

  url.replace(/index.html$/,'');

  const handler = children.find(vnode => match(vnode.props.path, url));
  return cloneElement(handler, handler.props);
};

export function match(path, url) {
  url = url.replace('index.html', '').replace('.html', '');
  if (typeof path === 'string') {
    return url.replace(/^\//, '') === path || url === path;
  }
  // FIXME: special-casing '/\//.test('/')
  // think more about all the slash-in-the-beginning/index.html situation
  return path.test(url.replace(/^\//, '')) || path.test(url);
}

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
