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

const t = test('build-script');

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
    // has to be a constructor (not an arrow fn)
    URL: function(path) { return path; },
    Buffer: {
      from: text => text,
    },
    console: {
      ...console,
      // suppress logs from modules, uncomment to see what is happenning
      log: () => {},
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
      const contentJson = `${JSON.stringify(options.contentJson)}`;
      return new vm.SourceTextModule(`
        export default {
          readFile: (args) => {
            return '${contentJson}';
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
      `, { context: referencingModule.context });
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
}

let initialOptions = {
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
  options = JSON.parse(JSON.stringify(initialOptions));
});

t(
  'Two files were written when we only had two files returned in readdir',
  async function() {
    options.readDirResponse = ['a.html', 'b.html'];
    await vmTest(options);
    await timeout();
    assert.equal(options.writtenFiles.length, 2);
  }
);

t('Pages are generated from content.json', async function () {
  options = initialOptions;
  options.contentJson = {
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
  await vmTest(options);
  await timeout();

  assert.equal(options.writtenFiles[0].file, './build/index.html');
  assert.equal(options.writtenFiles[1].file, './build/contact.html');

  // all data from content.json is passed as `pages` entry
  const {data} = options.writtenFiles[0].content;

  assert.equal(
    options.contentJson.pages[0].title,
    data.pages['/'].title
  );
  assert.equal(
    options.contentJson.pages[0].content,
    data.pages['/'].content
  );

  assert.equal(
    options.contentJson.pages[1].title,
    data.pages['/contact.html'].title
  );
  assert.equal(
    options.contentJson.pages[1].content,
    data.pages['/contact.html'].content
  );

  assert.equal(options.writtenFiles.length, 2);
});

const success = await t.run();

if (success === false) {
  process.exitCode = 1;
  throw new Error('test failed');
}
