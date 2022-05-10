import { on } from 'events'
import t from 'tap'
import Head from '../server.mjs'

t.test('can generate title tags', (t) => {
  t.plan(1)
  const head = new Head({
    title: 'Page Title',
  })
  t.equal(head.render(), '<title>Page Title</title>\n')
})

t.test('can generate base tags', (t) => {
  t.plan(1)
  const head = new Head({
    base: { href: 'https://example.com/', target: '_blank' },
  })
  t.equal(head.render(), '<base href="https://example.com/" target="_blank">\n')
})

t.test('can generate meta tags', (t) => {
  t.plan(1)
  const head = new Head({
    meta: [
      { property: 'twitter:title', content: 'Page Title' },
      { property: 'twitter:url', content: 'https://example.com' },
    ],
  })
  t.equal(head.render(), (
    '<meta property="twitter:title" content="Page Title">\n' +
    '<meta property="twitter:url" content="https://example.com">\n'
  ))
})

t.test('can generate link tags', (t) => {
  t.plan(1)
  const head = new Head({
    link: [
      { rel: 'icon', href: 'favicon.ico' },
      { rel: 'stylesheet', type: 'text/css', href: 'https://example.com/sheet.css' },
    ],
  })
  t.equal(head.render(), (
    '<link rel="icon" href="favicon.ico">\n' +
    '<link rel="stylesheet" type="text/css" href="https://example.com/sheet.css">\n'
  ))
})

t.test('can stream', (t) => {
  const head = new Head({
    title: 'Page Title',
  })
  const chunks = []
  const stream = head.stream()
  stream.on('data', (data) => {
    chunks.push(data)
    t.ok(chunks.includes('<title>Page Title</title>\n'))
    t.end()
  })
})
