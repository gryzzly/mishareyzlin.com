# A starter project for a prerendered preact-component-tree based website.

It uses: preact, preact/hooks, htm and preact-render-to-string.

There is a very simple router included. See ./src/router.js.

## How does it work?

Content can be stored in content.json, keyed by type of collection.
There is always at least one collection – pages.

## Development

For development, install dependencies

```
npm install
```

And then start file-watcher:

```
node start.js
```

This will rebuild HTML on changes in `/content` or `/src` folders.

The output folder is `build`.

In content:
- either `content.json` file
- html files can be used, they will be rendered as content inside of App.js

Start an http server to serve files from there directly:

```
http-server build
```

That’s it.

## Configuration

Open

## Production

Deploy build folder to CDN.
