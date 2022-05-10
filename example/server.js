import Fastify from 'fastify'
import { createReadStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import mergeStream from 'merge-stream'
import Head from 'unihead'

const server = Fastify()
const __dirname = dirname(new URL(import.meta.url).pathname)

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
    new Head({
      title: 'Page title',
      base: { href: '/', target: '_blank' },
      meta: [{ name: 'twitter:title', content: 'Title' }],
      script: [{ src: '/head.js' }],
    }).stream(),
    createReadStream(resolve(__dirname, 'client.html')),
  ))
})

server.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.code(500)
  reply.send('Check logs')
})

await server.listen(3000)
