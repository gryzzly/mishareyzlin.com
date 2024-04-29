export function document(content, data) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="Misha Reyzlin, HTML, CSS, JavaScript Developer" />
      <title>Misha Reyzlin: Hello</title>
      <link href="/main.css" rel="stylesheet" />

    </head>
    <body>
      <div id="app">${content}</div>
      ${/*
        consider sanitizing data that is printed, since it comes from the content
        files, an unescaped closing script tag stored in content, for example,
        would break the whole page
      */''}
      <script data-goatcounter="https://mishareyzlincom.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
    </body>
  </html>
`;
}
