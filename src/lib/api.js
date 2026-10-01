// Cliente REST para la API de Lab P1 (Spring Boot): /api/v1/blueprints, respuestas envueltas en { code, message, data }.
const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:8080').replace(/\/$/, '')
const ROOT = `${API_BASE}/api/v1/blueprints`

async function request(path, options = {}) {
  const res = await fetch(`${ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(`${options.method ?? 'GET'} ${path || '/'} → ${res.status} ${body?.message ?? ''}`.trim())
    err.status = res.status
    throw err
  }
  return body?.data ?? null
}

const bpPath = (author, name) => `/${encodeURIComponent(author)}/${encodeURIComponent(name)}`

/** Lista de planos del autor; si no tiene ninguno la API responde 404 → lista vacía. */
export async function listBlueprints(author) {
  try {
    return (await request(`/${encodeURIComponent(author)}`)) ?? []
  } catch (e) {
    if (e.status === 404) return []
    throw e
  }
}

export const getBlueprint = (author, name) => request(bpPath(author, name))

export const createBlueprint = ({ author, name, points }) =>
  request('', { method: 'POST', body: JSON.stringify({ author, name, points }) })

export const updateBlueprint = (author, name, points) =>
  request(bpPath(author, name), { method: 'PUT', body: JSON.stringify({ points }) })

export const deleteBlueprint = (author, name) => request(bpPath(author, name), { method: 'DELETE' })

export const pointCount = (bp) => bp.points?.length ?? bp.totalPoints ?? 0
