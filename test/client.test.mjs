import t from 'tap'
import { Window } from 'happy-dom'
import Head from '../client.mjs'

function getHead (initial = {}, document) {
  return new Head(initial, document)
}

t.test('can generate title tags', (t) => {
  t.plan(1)
  const window = new Window()
  const document = window.document
  const initial = { title: 'Page Title' }
  getHead(initial, document)
  const title = document.querySelector('head > title').textContent
  t.same(initial.title, title)
})

t.test('can mutate title tags', (t) => {
  t.plan(1)
  const window = new Window()
  const document = window.document
  const initialTitle = 'Page Title'
  document.head.innerHTML = `<title>${initialTitle}</title>`
  const head = getHead(null, document)
  const changedTitle = 'Changed Title'
  head.title = changedTitle
  const currentTitle = document.querySelector('title').textContent
  t.same(changedTitle, currentTitle)
})

t.test('can generate base tags', (t) => {
  t.plan(1)
  const window = new Window()
  const document = window.document
  const initial = { base: { href: 'https://example.com/', target: '_blank' } }
  getHead(initial, document)
  const baseElem = document.querySelector('head > base')
  const baseElemAttrs = {
    href: baseElem.attributes.href.value,
    target: baseElem.attributes.target.value,
  }
  t.same(initial.base, baseElemAttrs)
})

t.test('can generate meta tags', (t) => {
  t.plan(4)
  const window = new Window()
  const document = window.document
  const initial = {
    meta: [
      { property: 'twitter:title', content: 'Page Title' },
      { property: 'twitter:url', content: 'https://example.com' },
    ],
  }
  getHead(initial, document)
  for (const [i, metaTag] of Object.entries([...document.querySelectorAll('head > meta')])) {
    t.equal(initial.meta[i].property, metaTag.attributes.property.value)
    t.equal(initial.meta[i].content, metaTag.attributes.content.value)
  }
})

t.test('can mutate meta tags', (t) => {
  t.plan(4)
  const window = new Window()
  const document = window.document
  document.head.innerHTML = `
    <meta property="twitter:title" content="Page Title">
    <meta property="twitter:url" content="https://example.com">
  `
  const head = getHead(null, document)
  const changed = [
    { property: 'twitter:title', content: 'Changed Title'},
    { property: 'twitter:url', content: 'https://example.com/2' },
  ]
  for (const meta of changed) {
    head.meta.set(meta)
  }
  for (const [i, metaTag] of Object.entries([...document.querySelectorAll('head > meta')])) {
    t.equal(changed[i].property, metaTag.attributes.property.value)
    t.equal(changed[i].content, metaTag.attributes.content.value)
  }
})

t.test('can mutate meta tags with update', (t) => {
  t.plan(4)
  const window = new Window()
  const document = window.document
  document.head.innerHTML = `
    <meta property="twitter:title" content="Page Title">
    <meta property="twitter:url" content="https://example.com">
  `
  const head = getHead(null, document)
  const changed = [
    { property: 'twitter:title', content: 'Changed Title'},
    { property: 'twitter:url', content: 'https://example.com/2' },
  ]
  head.update({ meta: changed })
  for (const [i, metaTag] of Object.entries([...document.querySelectorAll('head > meta')])) {
    t.equal(changed[i].property, metaTag.attributes.property.value)
    t.equal(changed[i].content, metaTag.attributes.content.value)
  }
})


t.test('can reset to initial state', (t) => {
  t.plan(10)
  const window = new Window()
  const document = window.document
  const original = [
    { property: 'twitter:title', content: 'Page Title'},
    { property: 'twitter:url', content: 'https://example.com/' },
  ]
  document.head.innerHTML = `
    <title>Page Title</title>
    <meta property="${original[0].property}" content="${original[0].content}">
    <meta property="${original[1].property}" content="${original[1].content}">
  `
  const head = getHead(null, document)
  head.title = 'Changed Title'
  const changed = [
    { property: 'twitter:title', content: 'Changed Title'},
    { property: 'twitter:url', content: 'https://example.com/2' },
  ]
  for (const meta of changed) {
    head.meta.set(meta)
  }
  t.equal('Changed Title', document.querySelector('title').textContent)
  for (const [i, metaTag] of Object.entries([...document.querySelectorAll('head > meta')])) {
    t.equal(changed[i].property, metaTag.attributes.property.value)
    t.equal(changed[i].content, metaTag.attributes.content.value)
  }
  head.reset()
  t.equal('Page Title', document.querySelector('title').textContent)
  for (const [i, metaTag] of Object.entries([...document.querySelectorAll('head > meta')])) {
    t.equal(original[i].property, metaTag.attributes.property.value)
    t.equal(original[i].content, metaTag.attributes.content.value)
  }
})

// t.test('can generate link tags', (t) => {
//   t.plan(1)
//   const head = new Head({
//     link: [
//       { rel: 'icon', href: 'favicon.ico' },
//       { rel: 'stylesheet', type: 'text/css', href: 'https://example.com/sheet.css' },
//     ]
//   })
//   t.equal(head.render(), (
//     '<link rel="icon" href="favicon.ico">\n' +
//     '<link rel="stylesheet" type="text/css" href="https://example.com/sheet.css">\n'
//   ))
// })
