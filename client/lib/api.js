const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const REFRESH_PATH = '/api/auth/token/refresh/'

export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

export function setTokens({ access, refresh }) {
  if (typeof window === 'undefined') return
  if (access) localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return null

  const res = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  const payload = await res.json().catch(() => ({}))
  const body = payload?.data ?? payload
  if (!res.ok || !body?.access) {
    clearTokens()
    return null
  }
  setTokens({ access: body.access })
  return body.access
}

function unwrapResponsePayload(payload) {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success) {
      return payload.data
    }
    return payload.errors ?? payload
  }
  return payload
}

async function request(path, options = {}, retryOnAuthFailure = true) {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const payload = await res.json().catch(() => ({}))
  const data = unwrapResponsePayload(payload)

  if (res.status === 401 && retryOnAuthFailure) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request(path, options, false)
    }
  }

  if (!res.ok) {
    throw { status: res.status, data }
  }
  return data
}

export const api = {
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  get: (path) => request(path, { method: 'GET' }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path, body = null) =>
    request(path, {
      method: 'DELETE',
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
}
