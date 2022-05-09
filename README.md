# unihead

## Simple, fast, universal JS `<head>` management.

### Server usage

```js
import Fastify from 'fastify'
import Head from 'unihead'

const server = Fastify()

server.get('/', (req, reply) => {
  const head = new Head({
    title: 'Page title'
    base: { href: 'https://example.com', target: '_blank' },
    meta: [{ name: 'twitter:title', content: 'Title' }],
  })
  reply.type('text/html')
  reply.send(`<html><head>${
  	head.render()
  }</head><p>Head test</p></html>`)
})
```

### Client usage

1. Include client script as last element of your `<head>`:

```html
<head>
  <!-- Head elements -->
  <script src="https://unpkg.com/unihead"></script>
</head>
```

2. `window.head` is available immediately afterwards. It'll store the current 
`<head>` state internally and let you modify it or reset it to its orignal state.

```js
// Add or mutate <head> elements when possible
window.head.title = 'Page title'
window.head.base = { href: 'https://example.com', target: '_blank' }
window.head.meta.push({ name: 'twitter:title', content: 'Title' })
window.head.meta.remove(elem => elem.attrs.name === 'twitter:title')
window.head.meta.remove({ name: 'twitter:title' })

// Reset <head> to its original state
window.head.reset()
```
