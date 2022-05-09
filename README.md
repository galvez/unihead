# unihead

Simple, fast, universal JS `<head>` server-side writer and client-side manager.

Nearly every SSR framework out there relies on server-side components to update the `<head>`. This is the case for [Next][1], [Nuxt 2][2], [Nuxt 3][3] and [Remix][4]. The problem with that approach is that the `<head>` becomes dependent on your entire component stack being server-side rendered first, which is generally expensive and prevents you from streaming the `<head>` right away to the client. 

**`unihead`** is a library conveniently packing both a server-side API, that lets you generate `<head>` elements programatically, and a client-side API that hydrates a data model from the rendered elements independently of the framework you're using (all vanilla JavaScript) and lets you **mutate it** and also **reset it** to its original state (useful for managing `<head>` inbetween client-side route navigation). 

Read [this blog post]() for more info.

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

The server module of this package supports the adoption of an **_alternative pattern_** where all data required for rendering `<head>` elements is fetched prior to any framework-level component rendering, so it can be streamed to the client right away. 

The server-side `<head>` cannot be mutated, it must be created only once from an object.

</td>
<td valign="top"><br>

```js
import Head from 'unihead'

const head = new Head({
  title: 'Page Title'
  meta: [
    { name: 'twitter:title', content: 'Page Title' }
  ],
})
```

Below are two small snippets demonstrating usage with [Fastify](https://fastify.io/). 
There are two methods available: `render()`, which produces a full string with all rendered `<head>` elements.


```js
const head = new Head({ ... }).render()
reply.send(`<head>${head}</head><body>...</body>`)
```
  
And `stream()`, which returns a `Readable` Node.js stream (built from an `AsyncIterator`) that _yields_ one `<head>` element at a time. 

See a full streaming example [here]().

</td>
</tr>
</table>

<table>
<tr>
<td width="300px" valign="top">

<h2>

**Client usage (build tool)**

</h2>

If you're using a tool such as Vite to build your client application build, import the `client` module of the package and instantiate Head the same way it is done on the server.

</td>
<td valign="top"><br>

```js
import Head from 'unihead'

const head = new Head({
  title: 'Page Title'
  meta: [
    { name: 'twitter:title', content: 'Page Title' }
  ],
})
```

</td>
</tr>
</table>


<table>
<tr>
<td width="300px" valign="top">

<h2>

**Client usage (vanilla)**

</h2>

A global registration distribution is also available, that lets you simply include `unihead` as the *last* script import of your `<head>` and have it globally available (and automatically instantiated) in the `window` object.

</td>
<td valign="top"><br>

Include the vanilla JS distribution as last element of your `<head>`:

```html
<head>
  <!-- Head elements -->
  <script src="https://unpkg.com/unihead"></script>
</head>
```

`window.head` is available immediately afterwards. It'll store the current 
`<head>` state internally and let you modify it or reset it to its orignal state.

</td>
</tr>
</table>

