# unihead

Simple, fast, universal JS `<head>` server-side writer and client-side manager.

Nearly every SSR framework out there relies on server-side components to update the `<head>`. This is the case for [Next][1], [Nuxt 2][2], [Nuxt 3][3] and [Remix][4].

[1]: https://nuxtjs.org/docs/components-glossary/head/
[2]: https://v3.nuxtjs.org/guide/features/head-management
[3]: https://github.com/remix-run/remix/blob/main/packages/remix-react/components.tsx#L650
[4]: https://nextjs.org/docs/api-reference/next/head


<table>
<tr>
<td width="300px" valign="top">

<h2>

**Server usage**

</h2>

...

</td>
<td valign="top"><br>

...

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

...

</td>
</tr>
</table>


<table>
<tr>
<td width="300px" valign="top">

<h2>

**Client usage**

</h2>

...

</td>
<td valign="top"><br>

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


</td>
</tr>
</table>

