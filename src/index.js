import {
  hydrate,
  html,
  renderToString,
  Component,
} from './preact-hooks-htm-render-to-string.js';

import {
  Link,
  Router,
  useLocation,
} from './router.js';

// TODO: think about this some more.
const contentToHtml = (content) => content.split('\n')
  .filter(Boolean)
  .map(line => `<p>${line}</p>`)
  .filter(line => line !== '<p></p>')
  .join('');

export const routes = [
  {
    path: '/',
    component: (props) => {
      return html`<div>
        <div dangerouslySetInnerHTML=${{__html: contentToHtml(props.content)}}></div>
        ${props.news && props.news.map(item => html`<div>
          <h1>${item.title}</h1>
          <div>
            <img src=${item.image} />
          </div>
          <div dangerouslySetInnerHTML=${{
            __html: contentToHtml(item.content)
          }}></div>
        </div>`)}
      </div>  `;
    }
  },
  {
    path: '/notes/index.html',
    component: (props) => {
      return html`<div>
        <div dangerouslySetInnerHTML=${{__html: contentToHtml(props.content)}}></div>
        ${props.data && props.data.map(note => html`
          <${Link} href=${note.path}>
          <div dangerouslySetInnerHTML=${{__html: note.title}}></div>
          <//>
        `) }
      </div>  `;
    },
    getData: (pages, collections) => {
      const pagePaths =
          Object.keys(pages).filter(
            pagePath => /^\/notes\//.test(pagePath) && pagePath !== '/notes/index.html'
          );

      return pagePaths.map(path => pages[path]);
    }
  },
  // order is important,
  // put less specific routes last
  {
    path: /^(?:.*)$/,
    component: (props) => {
      return html`<div>
        <div
          dangerouslySetInnerHTML=${{__html: props.content}}>
        </div>
      </div>`;
    }
  }
];

function Logo() {
  return html`<${Link} href="/" id="logo">
    <svg title="mishareyzlin.com logo" viewBox="-12 90 739 1024" xmlns="http://www.w3.org/2000/svg">
      <path d="m705.536 434.176c0 18.432-5.12 36.864-13.312 53.248l-111.616 226.304c-10.24 20.48-18.432 40.96-18.432 52.224 0 6.144 3.072 10.24 10.24 10.24 26.624 0 87.04-90.112 98.304-90.112 10.24 0 15.36 11.264 15.36 17.408 0 8.192-109.568 138.24-172.032 138.24-33.792 0-50.176-15.36-50.176-43.008 0-19.456 8.192-45.056 23.552-76.8l110.592-225.28c8.192-15.36 11.264-27.648 11.264-37.888 0-15.36-10.24-24.576-27.648-24.576-45.056 0-123.904 121.856-229.376 286.72l-40.96 87.04c-7.168 13.312-19.456 21.504-48.128 21.504-37.888 0-47.104-11.264-41.984-21.504l148.48-311.296c7.168-14.336 10.24-26.624 10.24-35.84 0-17.408-10.24-26.624-28.672-26.624-52.224 0-130.048 122.88-232.448 286.72l-39.936 87.04c-5.12 12.288-19.456 21.504-48.128 21.504-37.888 0-47.104-11.264-41.984-21.504l144.384-311.296c8.192-19.456 16.384-37.888 16.384-50.176 0-7.168-3.072-12.288-10.24-12.288-27.648 0-87.04 90.112-95.232 90.112-10.24 0-16.384-11.264-16.384-17.408 0-9.216 105.472-138.24 167.936-138.24 37.888 0 51.2 20.48 51.2 46.08 0 22.528-10.24 50.176-20.48 72.704l-22.528 49.152c51.2-88.064 133.12-167.936 205.824-167.936 48.128 0 66.56 31.744 66.56 67.584 0 17.408-5.12 35.84-12.288 51.2l-20.48 41.984c53.248-86.016 125.952-160.768 196.608-160.768 47.104 0 65.536 31.744 65.536 65.536z"/>
    </svg>
  <//>`;
}

function Nav() {
  return html`<ul id="site-nav">
    <li><${Link} href="/">Hello<//></li>
    <li><${Link} href="/notes/index.html">Notes<//></li>
    <li><${Link} href="/works.html">Works<//></li>
    <li><${Link} href="/cv.html">CV<//></li>
  </ul>`;
}

export default class List extends Component {
  render({contents, notes}) {
    return contents && html`<div>
        <div dangerouslySetInnerHTML=${{ __html: contents}}></div>
        ${notes && notes.map(note => html`<li>
        <a href="${'/' + `${note.path.replace(/\.md$/, '.html')}`}">${note.title}</a>
      </li>`)}
      </div>`;
  }
}

export const App = ({url, collections, pages}) => {
  const [location, ] = useLocation(url);
  return html`
    <header id="site-header">
      <${Logo} />
      <${Nav} />
    </header>
    <main id="main">
      <${Router}
        url=${location}
      >
        ${routes.map( route => html`<${route.component}
        ...${pages[location]}
          url=${location}
          path=${route.path}
          data=${route.getData ? route.getData(pages, collections) : {}}
          ...${collections}
        />` )}
      <//>
    </main>`;
};

export function start() {
  hydrate(
    html`<${App}
      pages=${window.preloadedData.pages}
      collections=${window.preloadedData.collections}
    />`,
    document.querySelector('#app')
  );
}
