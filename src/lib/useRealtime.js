import { useCallback, useEffect, useRef, useState } from 'react'
import { createStompClient, subscribeBlueprint } from './stompClient.js'
import { createSocket } from './socketIoClient.js'

const IO_BASE = import.meta.env.VITE_IO_BASE ?? 'http://localhost:3001'
const STOMP_BASE = import.meta.env.VITE_STOMP_BASE ?? 'http://localhost:8080'

/**
 * Conecta al plano `blueprints.{author}.{name}` con la tecnología elegida.
 * `onUpdate(upd)` recibe `{ points }` (plano completo) o `{ point }` (punto nuevo).
 * Devuelve `{ status, sendPoint }`.
 */
export function useRealtime(tech, author, name, onUpdate) {
  const [status, setStatus] = useState('off')
  const connRef = useRef(null)
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (tech === 'none' || !author || !name) {
      setStatus('off')
      return
    }
    const room = `blueprints.${author}.${name}`
    setStatus('connecting')
    const handle = (upd) => onUpdateRef.current(upd)

    if (tech === 'stomp') {
      const client = createStompClient(STOMP_BASE)
      let sub = null
      client.onConnect = () => {
        sub = subscribeBlueprint(client, author, name, handle)
        setStatus('connected')
      }
      client.onWebSocketClose = () => setStatus('connecting')
      client.activate()
      connRef.current = {
        send: (point) => {
          if (!client.connected) return false
          client.publish({ destination: '/app/draw', body: JSON.stringify({ author, name, point }) })
          return true
        },
      }
      return () => {
        sub?.unsubscribe()
        client.deactivate()
        connRef.current = null
      }
    }

    const socket = createSocket(IO_BASE)
    socket.on('connect', () => {
      socket.emit('join-room', room) // se repite al reconectar
      setStatus('connected')
    })
    socket.on('disconnect', () => setStatus('connecting'))
    socket.on('blueprint-update', handle)
    connRef.current = {
      send: (point) => {
        if (!socket.connected) return false
        socket.emit('draw-event', { room, author, name, point })
        return true
      },
    }
    return () => {
      socket.disconnect()
      connRef.current = null
    }
  }, [tech, author, name])

  const sendPoint = useCallback((point) => connRef.current?.send(point) ?? false, [])
  return { status, sendPoint }
}
