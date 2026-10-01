import { useCallback, useEffect, useState } from 'react'
import BlueprintCanvas from './components/BlueprintCanvas.jsx'
import AuthorPanel from './components/AuthorPanel.jsx'
import { useRealtime } from './lib/useRealtime.js'
import * as api from './lib/api.js'

export default function App() {
  const [tech, setTech] = useState('none')
  const [author, setAuthor] = useState('juan')
  const [name, setName] = useState('plano-1')
  const [points, setPoints] = useState([])
  const [blueprints, setBlueprints] = useState([])
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }

  const fail = (err) => setMessage({ type: 'error', text: err.message })
  const ok = (text) => setMessage({ type: 'ok', text })

  const refreshList = useCallback(() => {
    if (!author) return setBlueprints([])
    api
      .listBlueprints(author)
      .then((l) => setBlueprints(l ?? []))
      .catch((e) => {
        setBlueprints([])
        fail(e)
      })
  }, [author])

  // Estado inicial del plano seleccionado
  useEffect(() => {
    if (!author || !name) return setPoints([])
    let cancelled = false
    api
      .getBlueprint(author, name)
      .then((bp) => !cancelled && setPoints(bp?.points ?? []))
      .catch(() => !cancelled && setPoints([])) // el plano aún no existe
    return () => {
      cancelled = true
    }
  }, [author, name])

  useEffect(refreshList, [refreshList])

  const onUpdate = useCallback((upd) => {
    if (Array.isArray(upd.points)) setPoints(upd.points)
    else if (upd.append?.length) setPoints((prev) => [...prev, ...upd.append])
  }, [])

  const { status, sendPoint } = useRealtime(tech, author, name, onUpdate)

  function handlePoint(point) {
    if (tech === 'none') setPoints((prev) => [...prev, point])
    else if (!sendPoint(point)) fail(new Error('Sin conexión de tiempo real todavía'))
    else if (tech === 'socketio') setPoints((prev) => [...prev, point]) // el server no hace eco al emisor
  }

  const run = (action, text) => async () => {
    try {
      await action()
      ok(text)
      refreshList()
    } catch (e) {
      fail(e)
    }
  }

  const create = run(() => api.createBlueprint({ author, name, points }), 'Plano creado')
  const save = run(() => api.updateBlueprint(author, name, points), 'Plano guardado')
  const remove = run(async () => {
    await api.deleteBlueprint(author, name)
    setPoints([])
  }, 'Plano eliminado')

  const input = { padding: 6, borderRadius: 6, border: '1px solid #ccc' }
  const noTarget = !author || !name

  return (
    <div style={{ fontFamily: 'Inter, system-ui', padding: 16, maxWidth: 960 }}>
      <h2>BluePrints RT – Socket.IO vs STOMP</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <label>Tecnología RT:</label>
        <select value={tech} onChange={(e) => setTech(e.target.value)} style={input}>
          <option value="none">None</option>
          <option value="socketio">Socket.IO (Node)</option>
          <option value="stomp">STOMP (Spring)</option>
        </select>
        <span title="estado de conexión RT">● {status}</span>
        <input style={input} value={author} onChange={(e) => setAuthor(e.target.value.trim())} placeholder="autor" />
        <input style={input} value={name} onChange={(e) => setName(e.target.value.trim())} placeholder="plano" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={create} disabled={noTarget}>Create</button>
        <button onClick={save} disabled={noTarget}>Save/Update</button>
        <button onClick={remove} disabled={noTarget}>Delete</button>
      </div>

      {message && (
        <p role="status" style={{ color: message.type === 'error' ? '#b91c1c' : '#15803d', margin: '4px 0' }}>
          {message.text}
        </p>
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <BlueprintCanvas points={points} onPoint={handlePoint} />
        <AuthorPanel author={author} blueprints={blueprints} selected={name} onSelect={setName} />
      </div>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Tip: abre 2 pestañas con el mismo autor/plano y dibuja para ver la colaboración.
      </p>
    </div>
  )
}
