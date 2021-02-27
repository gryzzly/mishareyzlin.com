import test from 'baretest';
import assert from 'assert';

import {Router} from '../src/router.js';
import {html, renderToString} from '../src/preact-hooks-htm-render-to-string.js';

function HomeComponent({foo}) {
  return html`<div class=${foo}>Home</div>`;
}

function NotRenderedComponent({foo}) {
  return html`<div class=${foo}>Home</div>`;
}

const t = test('router');

t('One route matches with exact string match', function() {
  assert.equal  (renderToString(html`<${Router} url="/">
    <${HomeComponent} path="/" foo="foo" />
  <//>`), `<div class="foo">Home</div>`);
});

t('One route matches with regex match', function() {
  assert.equal(renderToString(html`<${Router} url="/">
    <${HomeComponent} path=${/.*/} foo="foo" />
  <//>`), `<div class="foo">Home</div>`);
});

t('When many routes are there, route matches with exact string match', function() {
  assert.equal(renderToString(html`<${Router} url="/">
    <${NotRenderedComponent} path=${/exact1/} foo="foo" />
    <${HomeComponent} path="/" foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="foo">Home</div>`);
});

t('When many routes are there, route matches with regex match', function () {
  assert.equal(renderToString(html`<${Router} url="/">
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact4/} foo="foo" />
  <//>`), `<div class="foo">Home</div>`);
});

t('If there are two matching routes, first one is used', function () {
  assert.equal(renderToString(html`<${Router} url="/">
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="bar" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="bar">Home</div>`);
});

t('Match all doesn’t have priority over exact match', function() {
  assert.equal(renderToString(html`<${Router} url="/contact.html">
    <${HomeComponent} path=${/contact.html$/} foo="contact" />
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="contact">Home</div>`);
});


t('Match all doesn’t have priority over exact match', function () {
  assert.equal(renderToString(html`<${Router} url="/contact.html">
    <${HomeComponent} path=${/contact.html$/} foo="contact" />
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="contact">Home</div>`);
});

t('Match all doesn’t have priority over exact match', function() {
  assert.equal(renderToString(html`<${Router} url="/contact.html">
    <${HomeComponent} path=${/contact.html$/} foo="contact" />
    <${NotRenderedComponent} path=${/exact2/} foo="foo" />
    <${HomeComponent} path=${/.*/} foo="foo" />
    <${NotRenderedComponent} path=${/exact3/} foo="foo" />
  <//>`), `<div class="contact">Home</div>`);
});

!(async function() {
  const success = await t.run();

  if (success === false) {
    process.exitCode = 1;
    throw new Error('test failed');
  }
})()
