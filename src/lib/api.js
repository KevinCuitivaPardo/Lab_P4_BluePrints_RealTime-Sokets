const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:8080').replace(/\/$/, '')

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${options.method ?? 'GET'} ${path} → ${res.status} ${detail}`.trim())
  }
  return res.status === 204 ? null : res.json().catch(() => null)
}

const bpPath = (author, name) => `/api/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`

export const listBlueprints = (author) =>
  request(`/api/blueprints?author=${encodeURIComponent(author)}`)

export const getBlueprint = (author, name) => request(bpPath(author, name))

export const createBlueprint = (bp) =>
  request('/api/blueprints', { method: 'POST', body: JSON.stringify(bp) })

export const updateBlueprint = (author, name, bp) =>
  request(bpPath(author, name), { method: 'PUT', body: JSON.stringify(bp) })

export const deleteBlueprint = (author, name) => request(bpPath(author, name), { method: 'DELETE' })

export const pointCount = (bp) => bp.points?.length ?? bp.totalPoints ?? 0
