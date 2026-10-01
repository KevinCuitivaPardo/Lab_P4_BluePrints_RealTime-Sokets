import { io } from 'socket.io-client'

export function createSocket(baseUrl) {
  const socket = io(baseUrl, { transports: ['websocket'] })
  socket.on('connect', () => console.info('[Socket.IO] conectado', socket.id))
  socket.on('disconnect', (reason) => console.warn('[Socket.IO] desconectado:', reason))
  socket.on('connect_error', (err) => console.error('[Socket.IO] error:', err.message))
  return socket
}
