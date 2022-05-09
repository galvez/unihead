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

**Client usage**

</h2>

If you're using a tool such as Vite to build your client application build, import the `client` module of the package and instantiate Head the same way it is done on the server.
  
A global registration distribution is also available, that lets you simply include `unihead` as the *last* script import of your `<head>` and have it globally available (and automatically instantiated) in the `window` object.

The client `Head` class will load the rendered `<head>` from the page internally in a data model and let you modify it or reset it to its orignal state if needed.


</td>
<td valign="top"><br>
  
Import using a build tool:

```js
import Head from 'unihead/client'

const head = new Head()
```
  
Vanilla script include (last element of your `<head>`):

```html
<head>
  <!-- Head elements -->
  <script src="https://unpkg.com/unihead"></script>
</head>
```

In which case `window.head` is available immediately afterwards, automatically instantied from the `Head` class. 

This option is provided for easily integrating **`unihead`** with any kind of vanilla HTML/JS application.

</td>
</tr>
</table>


<table>
<tr>
<td width="300px" valign="top">

<h2>

**Mutation methods**

</h2>

The main difference between the *server* and *client* modules is that the latter allows you to mutate the data, i.e., change existing elements or add new ones if needed. API follows:
  
- `head.title`
- `head.base`
- `head.meta[]`
- `head.link[]`
- `head.style[]`
- `head.script[]`

</td>
<td valign="top"><br>
  
For the single, empty elements `title` and `base`, assignment:

```js
head.title = 'Page title'
head.base = { href: 'https://...', target: '_blank' }
```

For the collective empty elements `meta` and `link`, `set()`:

```js
window.head.meta.set({
  name: 'twitter:title',
  content: 'Title'
})
```

In the case of `<meta>` tags, `name` and `property` are used to uniquely identify a tag and mutate it without having to add a new one if it already exists.
  
To remove collection items:
  
```js
window.head.meta.remove((elem) => {
  return elem.attrs.name === 'twitter:title'
})
```

Finally, you can fully reset <head> to its original state:
  
```js
window.head.reset()
```

</td>
</tr>
</table>

