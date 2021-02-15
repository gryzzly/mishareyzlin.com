export function document(content, data) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="Misha Reyzlin, HTML, CSS, JavaScript Developer" />
      <title>Misha Reyzlin: Hello</title>

      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans&display=swap" rel="stylesheet" />
      <link href="/main.css" rel="stylesheet" />

    </head>
    <body>
      <div id="app">${content}</div>
      ${data && `<script>window.preloadedData = ${JSON.stringify(data)}</script>`}
      <script type="module">
      import {start} from "/index.js";
      start();
      </script>
    </body>
  </html>
`;
}
