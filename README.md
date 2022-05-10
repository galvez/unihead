# unihead

Fast and minimal JS `<head>` **server-side writer** and **client-side manager**.

Nearly every SSR framework out there relies on server-side components to update the `<head>`. This is the case for [Next][1], [Nuxt 2][2], [Nuxt 3][3] and [Remix][4]. The problem with that approach is that the `<head>` becomes dependent on your entire component stack being server-side rendered first, or at least a big part of it, which is generally expensive and prevents you from streaming the `<head>` right away to the client. 

**`unihead`** is a library conveniently packing both a server-side API, that lets you generate `<head>` elements programatically, and a client-side API that hydrates a data model from the rendered elements independently of the framework you're using (all vanilla DOM manipulation) and lets you **mutate it** and also **reset it** to its original state (useful for managing `<head>` inbetween client-side route navigation). 

[1]: https://nuxtjs.org/docs/components-glossary/head/
[2]: https://v3.nuxtjs.org/guide/features/head-management
[3]: https://github.com/remix-run/remix/blob/main/packages/remix-react/components.tsx#L650
[4]: https://nextjs.org/docs/api-reference/next/head

## Install

```bash
npm install unihead --save
```

## Server usage

The server module of this package supports the adoption of an **_alternative pattern_** where all data required for rendering `<head>` elements is fetched prior to any framework-level component rendering, so it can be streamed to the client right away. 

The server-side `<head>` cannot be mutated, it must be created only once from an object.

```js
import Head from 'unihead'

const head = new Head({
  title: 'Page Title'
  meta: [
    { name: 'twitter:title', content: 'Page Title' }
  ],
})
```

There are two methods available: `render()`, which produces a full string with all rendered `<head>` elements.

```js
const head = new Head({ ... }).render()
const html = `<head>${head}</head><body>...</body>`
```
  
And `stream()`, which returns a `Readable` Node.js stream (built from an `Iterator`) that _yields_ one `<head>` element at a time. 

See a full streaming example [here](https://github.com/galvez/unihead/tree/main/example).

## Client usage

If you're using a tool such as Vite to build your client application build, import the `client` module of the package and instantiate Head the same way it is done on the server.
  
A global registration distribution is also available, that lets you simply include `unihead` as the *last* script import of your `<head>` and have it globally available (and automatically instantiated) in the `window` object.

The client `Head` class will load the rendered `<head>` from the page internally in a data model and let you modify it or reset it to its orignal state if needed.

### Import using a build tool

```js
import Head from 'unihead/client'

const head = new Head()
```
  
### Vanilla script include

```html
<head>
  <!-- Head elements -->
  <script src="https://unpkg.com/unihead"></script>
</head>
```

In which case `window.head` is available immediately afterwards, automatically instantied from the `Head` class. 

This option is provided for easily integrating **`unihead`** with any kind of vanilla HTML/JS application.

## Mutation methods

The main difference between the *server* and *client* modules is that the latter allows you to mutate the data, i.e., change existing elements or add new ones if needed. API follows:
  
- `head.title=`
- `head.base=`
- `head.meta[].set()`
- `head.link[].set()`
- `head.meta[].push()`
- `head.link[].push()`
  
For standalone self-closing elements, use assignment:

```js
head.title = 'Page title'
head.base = { href: 'https://...', target: '_blank' }
```

For collective self-closing elements, use `set()`:

```js
head.meta.set({ name: '...', content: '...' })
```
  
You can also use `push(arr)` to set multiple tags at once.

In the case of `<meta>` tags, `name` and `property` are used to uniquely identify tags and mutate them without having to add new ones if they already exist. 

You can also remove collection items:
  
```js
head.meta.remove({name: 'twitter:title'})
```

Finally, you can also fully reset any changes made:
  
```js
head.reset()
```

## Limitations

When compared to libraries like [`vueuse/head`](https://github.com/vueuse/head), which is integrated with a framework, you'll notice **`unihead`** is missing a few features:
  
- There's no way to set `<html>` and `<body>` attributes.

- There's no way to create `<script>` tags with content, just attributes.
  
- Similarly, there's no way to create `<style>` tags.
  
**`unihead`** limits itself to either empty or self-closing elements under `<head>`.
