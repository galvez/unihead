import Fastify from 'fastify'
import { createReadStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { Readable } from 'node:stream'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import Head from 'unihead'

const server = Fastify()

// async function * streamHtml (head, body) {
//   for (const chunk of head) {
//     yield chunk
//   }
//   for await (const chunk of body) {
//     yield chunk
//   }
// }

// server.decorateReply('html', function (head, body) {
//   this.send(Readable.from(streamHtml(head, body)))
// })

server.get('/', async (req, reply) => {
  reply.type('text/html')
  reply.send(
    new Head({
      title: 'Page title',
      base: { href: '/', target: '_blank' },
      meta: [{ name: 'twitter:title', content: 'Title' }],
    }).render() +
    await renderToString(createSSRApp({
      data: () => ({
        message: 'Combined Streaming!',
        total: 1000,
      }),
      template: `
        <p>Combined Streaming!</p>
        <p v-for="i in total">Message {{ i }}</p>
      `
    }))
  )
})

await server.listen(3000)
