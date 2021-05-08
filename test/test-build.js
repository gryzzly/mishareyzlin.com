'use strict'
// So, what is build.js?
//
// build.js is a small script that takes a content folder, looks
// for `content.json` and pre-built (hand-written in my case) .html files
// in it, iterates over all these files and renders the component tree with
// these contents as props, plus it injects all other keys available
// from `content.json` into props. (menus, videos, news, notes etc.) – all
// that stuff that editor can update via admin, based on a schema.
import fs from 'fs';
import path from 'path';

import test from 'baretest';
import vm from 'vm';
import assert from 'assert';
import { time } from 'console';

const t = test('Testing Build Script');

let buildScript = fs.readFileSync(
  path.resolve(path.resolve(), './build.js'),
  'utf-8'
);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function vmTest(options) {
  const buildContext = vm.createContext({
    process: {
      argv: [,,'run']
    },
    Buffer: {
      from: text => text,
    },
    console: {
      ...console,
      // suppress logs from modules, uncomment to see what is happenning
      log: () => {},
      // use testLog in the tested file to debug tests
      testLog: console.log,
    },
    writtenFiles: options.writtenFiles
  });

  const buildModule = new vm.SourceTextModule(buildScript, {
    context: buildContext,
    importModuleDynamically: async (specifier) => {
      const dynamiclyImportedModule = new vm.SourceTextModule(`
        export function document(dom, data) {
          return {
            dom, data
          }
        };
        export const routes = {};
        export const App = () => {};
      `, { context: buildContext });
      await dynamiclyImportedModule.link(() => {});
      await dynamiclyImportedModule.evaluate();
      return dynamiclyImportedModule;
    }
  });

  // idea:
  // modules could define an export for the mocked version of themselves,
  // possibly configurable:
  // then dependencies of the tested module could be analysed and iterated over
  // to define SourceTextModule for each and provide the base context
  async function linker(specifier, referencingModule) {
    if (specifier === 'path') {
      return new vm.SourceTextModule(`
        export default {
          dirname: (src) => src,
          join: function() { return [].slice.call(arguments).join('/')  }
        };
      `, { context: referencingModule.context });
    }

    if (specifier === 'fs-extra') {
      return new vm.SourceTextModule(`
        export default {
          readFile: (filePath) => {
            const responses =
                ${JSON.stringify(options.readFileResponse)} || {};

            return responses[filePath] || "{}";
          },
          readdir: () => ${JSON.stringify(options.readDirResponse)},
          ensureDir: () => {},
          // writtenFiles is provided via context
          writeFileSync: (file, content) => {
            writtenFiles.push({
              file: file,
              content: content
            });
          },
          copyFile: () => {},
          statSync: (filepath) => {
            return {
              isDirectory: function() {
                return filepath.endsWith('/') || filepath.indexOf('.') === -1
              }
            }
          }
        };
      `, {
        identifier: specifier + '.js',
        context: referencingModule.context
      });
    }

    if (specifier === 'snarkdown') {
      return new vm.SourceTextModule(`
        export default function snarkdown(src) {
          return src;
        };
      `, { context: referencingModule.context });
    }

    if (specifier === './src/preact-hooks-htm-render-to-string.js') {
      return new vm.SourceTextModule(`
        export function html ( html ) { return html; };
        export function renderToString() { return 'rendered' }
      `, { context: referencingModule.context });
    }

    throw new Error(`Unable to resolve dependency: ${specifier}`);
  }

  await buildModule.link(linker);

  await buildModule.evaluate();
  // without deferring to the next tick, for some reason
  // awaiting "evaluate" ^ above is not sufficient
  await timeout();
}

let initialTestOptions = {
  readFileResponse: "{}",
  readDirResponse: [],
  writtenFiles: [],
  contentJson: {
    pages: [],
    menu: []
  }
};

let options;

// reset options [that will get modified] before each run
t.before(function () {
  options = JSON.parse(JSON.stringify(initialTestOptions));
});

t('Pages are generated from content.json', async function () {
  const contentJson = {
    pages: [{
      path: "/",
      title: "test-title",
      content: "test-content"
    }, {
      path: "/contact.html",
      title: "test-title",
      content: "test-content"
    }]
  };
  options.readFileResponse = {
    'content/content.json': JSON.stringify(contentJson),
  };
  await vmTest(options);

  assert.equal(options.writtenFiles[0].file, './build/index.html');
  assert.equal(options.writtenFiles[1].file, './build/contact.html');

  // all data from content.json is passed as `pages` entry
  const {data} = options.writtenFiles[0].content;

  assert.equal(
    contentJson.pages[0].title,
    data.pages['/'].title
  );
  assert.equal(
    contentJson.pages[0].content,
    data.pages['/'].content
  );

  assert.equal(
    contentJson.pages[1].title,
    data.pages['/contact.html'].title
  );
  assert.equal(
    contentJson.pages[1].content,
    data.pages['/contact.html'].content
  );

  assert.equal(options.writtenFiles.length, 2);
});

t(
  'Pages are generated from source html files',
  async function() {
    options.readDirResponse = ['a.html', 'b.html'];
    await vmTest(options);
    assert.equal(options.writtenFiles.length, 2);
  }
);

t(
  'Pages are generated from source markdown files',
  async function() {
    options.readFileResponse = {
      'content/a.md': '# Title A\nBody A',
      'content/b.md': 'Body B',
      'content/c.mdown': 'date: Apr 10 2012\n\nBody C',
      'content/d.md': 'date: Apr 10 2012\nfoo: bar\n\nBody D',
      'content/e-dashed-title.md': 'Body E\n\nSome more text',
    };
    options.readDirResponse =
      Object.keys(options.readFileResponse)
        .map(key => key.replace(/^content\//, ''));

    await vmTest(options);

    const {pages} = options.writtenFiles[0].content.data;

    // From two markdwon source files, two files were written
    assert.equal(options.writtenFiles.length, 5);
    // content/*.md was transformed to respective /build/*.html
    assert.equal(options.writtenFiles[0].file, './build/a.html');
    assert.equal(options.writtenFiles[1].file, './build/b.html');
    assert.equal(options.writtenFiles[2].file, './build/c.html');
    assert.equal(options.writtenFiles[3].file, './build/d.html');
    assert.equal(options.writtenFiles[4].file, './build/e-dashed-title.html');
    // Titles was correctly extracted from Markdown
    assert.equal(
      pages['/a'].title,
      "Title A"
    );
    // Title was generated from Filename when no title is present in Markdown
    assert.equal(
      pages['/b'].title,
      "B"
    );
    // Frontmatter didn’t break creation of correct title (from filename here)
    assert.equal(
      pages['/c'].title,
      "C"
    );
    // dashed-title become Capitalized Title:
    assert.equal(
      pages['/e-dashed-title'].title,
      "E Dashed Title"
    )
    // frontmatter correctly parsed
    assert.equal(
      pages['/c'].date,
      'Apr 10 2012'
    )
    // two pieces of data in frontmatter
    assert.equal(
      pages['/d'].date,
      'Apr 10 2012'
    )
    assert.equal(
      pages['/d'].foo,
      'bar'
    )
    // Content was written
    assert.equal(
      pages['/a'].content,
      `<p>Body A</p>`
    );
    assert.equal(
      pages['/b'].content,
      `<p>Body B</p>`
    );
    assert.equal(
      pages['/c'].content,
      `<p>Body C</p>`
    );
    assert.equal(
      pages['/d'].content,
      `<p>Body D</p>`
    );
    assert.equal(
      pages['/e-dashed-title'].content,
      `<p>Body E</p>\n<p>Some more text</p>`
    );
    // Frontmatter was removed
    // 'content/c.mdown': 'date: Apr 10 2012\n\nBody C',
    // 'content/d.md': 'date: Apr 10 2012\nfoo: bar\n\nBody D',
  }
);

t(
  'Mixing all types of content together works',
  async () => {
    options.readFileResponse = {
      'content/a.md': '# Title A\n\nBody A',
      'content/b.md': '# Title B\n\nBody B',
      'content/content.json': JSON.stringify({
        pages: [{
          path: "/",
          title: "test-title",
          content: "test-content"
        }, {
          path: "/contact.html",
          title: "test-title",
          content: "test-content"
        }]
      })
    };
    options.readDirResponse = ['a.md', 'b.md'];
    await vmTest(options);
    //  TODO add tests
    // Also test the situation of mixed collections
  }
)


const success = await t.run();

if (success === false) {
  process.exitCode = 1;
  throw new Error('test failed');
}
