import assert from 'assert';
import {Router} from '../src/router.js';

import {html, renderToString} from '../src/preact-hooks-htm-render-to-string.js';

function HomeComponent({foo}) {
  return html`<div class=${foo}>Home</div>`;
}

function NotRenderedComponent({foo}) {
  return html`<div class=${foo}>Home</div>`;
}

function test() {
   console.log('One route matches with exact string match');
  assert.equal(renderToString(html`<${Router} url="/">
    <${HomeComponent} path="/" foo="foo" />
  <//>`), `<div class="foo">Home</div>`);
  console.log('Pass!\n')

  console.log('One route matches with regex match');
  assert.equal(renderToString(html`<${Router} url="/">
    <${HomeComponent} path=${/.*/} foo="foo" />
  <//>`), `<div class="foo">Home</div>`);
  console.log('Pass!\n')

  console.log(
    'When many routes are there, route matches with exact string match'
  );
  assert.equal(renderToString(html`<${Router} url="/">
    <${NotRenderedComponent} path=${/exact1/} foo="foo" />
    <${HomeComponent} path="/" foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="foo">Home</div>`);
  console.log('Pass!\n')

  console.log(
    'When many routes are there, route matches with regex match'
  );
  assert.equal(renderToString(html`<${Router} url="/">
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact4/} foo="foo" />
  <//>`), `<div class="foo">Home</div>`);
  console.log('Pass!\n')

  console.log(
    'If there are two matching routes, first one is used'
  );
  assert.equal(renderToString(html`<${Router} url="/">
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="bar" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="bar">Home</div>`);
  console.log('Pass!\n')

  console.log(
    'Match all doesn’t have priority over exact match'
  );
  assert.equal(renderToString(html`<${Router} url="/contact.html">
    <${HomeComponent} path=${/contact.html$/} foo="contact" />
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="contact">Home</div>`);
  console.log('Pass!\n')

  console.log(
    'Match all doesn’t have priority over exact match'
  );
  assert.equal(renderToString(html`<${Router} url="/contact.html">
    <${HomeComponent} path=${/contact.html$/} foo="contact" />
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="contact">Home</div>`);
  console.log('Pass!\n')

  console.log(
    'Match all doesn’t have priority over exact match'
  );
  assert.equal(renderToString(html`<${Router} url="/contact.html">
    <${HomeComponent} path=${/contact.html$/} foo="contact" />
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="contact">Home</div>`);
  console.log('Pass!\n')
}

test();

console.log('All tests pass! Wunderbar!')
