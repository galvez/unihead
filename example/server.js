import Fastify from 'fastify'
import { createReadStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { Readable } from 'node:stream'
import { setTimeout } from 'node:timers/promises'

const server = Fastify()
const __dirname = dirname(new URL(import.meta.url).pathname)

async function * render () {
  await setTimeout(1000)
  yield '<p>1 second has passed</p>'
  await setTimeout(1000)
  yield '<p>2 seconds have passed</p>'
  await setTimeout(1000)
  yield '<p>3 seconds have passed</p>'
}

server.get('/head.js', (_, reply) => {
  reply.type('text/javascript')
  reply.send(createReadStream(resolve(__dirname, '..', 'client.js')))
})

server.get('/dummy.js', (_, reply) => {
  reply.type('text/javascript')
  reply.send('')
})

server.get('/dummy.css', (_, reply) => {
  reply.type('text/css')
  reply.send('')
})

server.get('/', (req, reply) => {
  // const readable = Readable.from(render())
  reply.type('text/html')
  reply.send(createReadStream(resolve(__dirname, './client.html')))
})

await server.listen(3000)
