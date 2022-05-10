import { Window } from 'happy-dom'
import Head from './client.js'
import repl from 'node:repl'

function getHead (initial = {}, document) {
  return new Head(initial, document)
}

const window = new Window()
const document = window.document

document.head.innerHTML = '<title>Page Title</title>'

// const head = getHead(null, document)
// head.title = 'Changed Title'

// Object.assign(repl.start('> ').context, {
//   head: getHead({
//     meta: [
//       { property: 'twitter:title', content: 'Page Title' },
//       { property: 'twitter:url', content: 'https://example.com' },
//     ]
//   }, document),
//   document,
// })

Object.assign(repl.start('> ').context, {
  head: getHead(null, document),
  document,
})
