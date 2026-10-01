import { Client } from '@stomp/stompjs'

export function createStompClient(baseUrl) {
  const wsUrl = baseUrl.replace(/\/$/, '').replace(/^http/, 'ws')
  return new Client({
    brokerURL: `${wsUrl}/ws-blueprints`,
    reconnectDelay: 1000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onStompError: (f) => console.error('[STOMP] error', f.headers['message']),
  })
}

export function subscribeBlueprint(client, author, name, onMsg) {
  return client.subscribe(`/topic/blueprints.${author}.${name}`, (m) => onMsg(JSON.parse(m.body)))
}
