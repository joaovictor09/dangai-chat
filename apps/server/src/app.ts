import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { WebSocket } from 'ws' // importa o tipo WebSocket

const app = Fastify()
app.register(fastifyWebsocket)

const clients = new Set<WebSocket>()

app.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
    clients.add(socket)

    socket.on('message', (buffer) => {
      const message = buffer.toString('utf8')

      try {
        const data = JSON.parse(message)

        for (const client of clients) {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: 'message',
              text: data.text
            }))
          }
        }
      } catch (err) {
        console.error('Erro ao processar mensagem:', err)
      }
    })

    socket.on('close', () => {
      clients.delete(socket)
    })
  })
})

export default app
