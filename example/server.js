import Fastify from 'fastify'
import { createReadStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { Readable } from 'node:stream'
import mergeStream from 'merge-stream'
import Head from '../server.js'

const server = Fastify()
const __dirname = dirname(new URL(import.meta.url).pathname)

async function * renderHead () {
  const head = new Head({
    title: 'Page title',
    base: { href: '/', target: '_blank' },
    meta: [{ name: 'twitter:title', content: 'Title' }],
    script: [{ src: '/head.js' }],
  })
  yield `<head>${head.render()}</head>`
}

server.get('/head.js', (_, reply) => {
  reply.type('text/javascript')
  reply.send(createReadStream(resolve(__dirname, '..', 'dist/unihead.umd.js')))
})

server.get('/dummy.js', (_, reply) => {
  reply.type('text/javascript')
  reply.send('')
})

server.get('/dummy.css', (_, reply) => {
  reply.type('text/css')
  reply.send('')
})

server.get('/', async (req, reply) => {
  reply.type('text/html')
  reply.send(mergeStream(
    Readable.from(renderHead()),
    createReadStream(resolve(__dirname, 'client.html')),
  ))
})

server.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.code(500)
  reply.send('Check logs')
})

await server.listen(3000)
