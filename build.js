import path from 'path';
import fse from 'fs-extra';
import snarkdown from 'snarkdown';

// adds <p></p> instead of line breaks to do styling properly
function snarkdownEnhanced(markdown) {
  return markdown
    .split(/(?:\r?\n){2,}/)
    .map((l) =>
      [" ", "\t", "#", "-", "*", ">"].some((char) => l.startsWith(char))
        ? snarkdown(l)
        : `<p>${snarkdown(l)}</p>`
    )
    .join("\n");
}

// look into adding typography processing to content
// https://github.com/sapegin/richtypo.js/

import {html, renderToString} from './src/preact-hooks-htm-render-to-string.js';

async function collectFilesDeep(directory, filterFn) {
  let paths = [];

  const files = (await fse.readdir(directory))
    .map(file => path.join(directory, file));

  const directories = files
    .filter(file => fse.statSync(file).isDirectory());

  paths = paths.concat(files.filter(filterFn));

  const nestedPaths =
    await Promise.all(
      directories.map(
        async (nestedDirectory) => await collectFilesDeep(
          nestedDirectory,
          filterFn
        )
      )
    );

  paths = paths.concat(nestedPaths.flat());

  return paths;
}


export async function build() {
  // in order to get freshest versions on every change:
  // dynamic import + cache buster
  const {document} = await import('./src/document.js'+`?${Date.now()}`);
  const {routes, App} = await import('./src/index.js'+`?${Date.now()}`);

  const start = new Date();
  console.log(`\n${start.toLocaleString('de-DE')}\n`);

  console.log("Collecting contents");
  // parse JSON content
  const content = JSON.parse(await fse.readFile('content/content.json'));
  content.pages = content.pages || [];

  content.pages.forEach(page => {
    if (page.path[0] !== '/') {
      page.path = `/${page.path}`;
    }
  })
  console.log(`Found ${content.pages ? content.pages.length : 0} pages`);

  // collect html content files
  let htmlPages = await collectFilesDeep(
    'content',
    (file) => file.endsWith('.html')
  );

  htmlPages = await Promise.all(
    htmlPages.map(async page => ({
      path: '/' + page.replace(/^content\//, '').replace(/.html$/, ''),
      content: (await fse.readFile(page)).toString()
    }))
  );
  console.log(`Found ${htmlPages.length} HTML pages`);

  // collect markdown files
  let markdownPagePaths = await collectFilesDeep(
    'content',
    (file) => file.endsWith('.md') || file.endsWith('.mdown')
  );

  const markdownPages = await Promise.all(
    markdownPagePaths.map(async markdownFile => {
      let fileContent = (await fse.readFile(markdownFile)).toString();

      let firstTitleIndex = -1;
      const firstTitleLine = fileContent
        .split('\n')
        .find((line, index) => {
          if (line.startsWith('#')) {
            firstTitleIndex = index;
            return true;
          }
        });

      const title = firstTitleLine
        .replace(/^\# /, '');

      const customFrontMatterProps = fileContent
        .split('\n')
        .slice(0, firstTitleIndex)
        .filter(line => line)
        .reduce((result, line) => {
          const [key, value] = line.split(':');
          result[key.trim()] = value.trim();
          return result;
        }, {})

      fileContent = fileContent.split('\n').slice(firstTitleIndex + 1).join('\n');

      return {
        path: '/' + markdownFile
          .replace(/^content\//, '')
          // for folder index pages, replace /index.md with /
          .replace(/index.md(own)?$/, '')
          .replace(/\.md(own)?$/, ''),
        content: snarkdownEnhanced(fileContent),
        title,
        ...customFrontMatterProps
      };
    })
  );

  // sort mutates the list
  // FIXME: sort by date is very specific to the notes, how can this be
  // made configurable?
  markdownPages.sort((a, b) => {
    const dateA = a.Date ? new Date(a.Date) : new Date()
    const dateB = b.Date ? new Date(b.Date) : new Date()
    return (dateB.getTime() - dateA.getTime());
  })

  content.pages = content.pages.concat(markdownPages);

  // add htmls to json content
  content.pages = content.pages.concat(htmlPages);

  // build a collection from each folder in content – 
  // this means, that if there is a folder, like notes, all pages in that
  // folder should have access to all files in that folder, to allow showing
  // an index of these files, or to do "next" / "prev" links
  // TODO

  // pick all keys off content that is not collection of "page" objects
  const {pages, ...collections} = content;

  const pagesByPath = pages.reduce((result, page) => {
    result[page.path] = page;
    return result;
  }, {});

  // prerender component trees
  const files = pages.map(page => {
    return {
      path: page.path,
      content: document(
        renderToString(
          html`
            <${App}
              pages=${pagesByPath}
              collections=${collections}
              url=${page.path}
            />
          `
        ),
        {
          page,
          pages: pagesByPath,
          collections
        }
      )
    };
  });

  console.log('Starting build');
  await fse.ensureDir('./build');

  // build files
  files.forEach(async file => {
    if (file.path === '' || file.path === '/') {
      file.path = '/index.html';
    }
    // directory listing
    if (file.path.endsWith('/')) {
      file.path += '/index.html';
    }
    // our paths are without extension, to allow for pretty links
    // but the content files written are always HTML anyway
    if (!file.path.endsWith('.html')) {
      file.path += '.html';
    }

    // ensure dirs exist for each fragment of the path
    await fse.ensureDir(`./build${path.dirname(file.path)}`)
    fse.writeFileSync(`./build${file.path}`, Buffer.from((file.content)));
  });
  console.log(`Pre-rendered ${files.length} files.`);

  // copy src files
  const srcFiles = await fse.readdir('./src');
  await Promise.all(
    srcFiles.map(async file => await fse.copyFile(
      `./src/${file}`,
      `./build/${file}`
    ))
  );

  const end = new Date();
  console.log(`Copied source files.`);
  console.log(`And done in ${end - start}ms\n`);
}

if (process.argv[2] && process.argv[2] === "run") {
  build();
}
