import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { WebSocket } from 'ws'

const app = Fastify()
app.register(fastifyWebsocket)

const clients = new Set<WebSocket>()

app.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    console.log('🟢 Novo cliente conectado')
    clients.add(socket)

    // 🔁 Envia ping a cada 25 segundos
    const pingInterval = setInterval(() => {
      if (socket.readyState === socket.OPEN) {
        console.log('📤 Enviando ping para cliente')
        socket.ping()
      }
    }, 25000)

    // Opcional: loga quando o cliente responde com pong
    socket.on('pong', () => {
      console.log('📥 Cliente respondeu ao ping (pong)')
    })

    socket.on('message', (buffer) => {
      const message = buffer.toString('utf8')

      try {
        const data = JSON.parse(message)

        for (const client of clients) {
          if (client.readyState === client.OPEN) {
            if (data.type === 'clear') {
              client.send(JSON.stringify({
                type: 'clear'
              }))

              return
            }

            client.send(JSON.stringify({
              type: 'message',
              id: data.id,
              text: data.text,
              userId: data.userId,
              date: new Date().toISOString()
            }))
          }
        }
      } catch (err) {
        console.error('❌ Erro ao processar mensagem:', err)
      }
    })

    socket.on('close', () => {
      clearInterval(pingInterval)
      clients.delete(socket)
      console.log('🔴 Cliente desconectado')
    })

    socket.on('error', (err) => {
      console.error('⚠️ Erro na conexão WebSocket:', err)
    })
  })
})

export default app
