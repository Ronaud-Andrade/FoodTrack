import { clearSession, getToken } from './session.js'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(status, body) {
    super(`A API respondeu com status ${status}.`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function readResponseBody(response) {
  if (response.status === 204) {
    return undefined
  }

  const text = await response.text()
  if (!text) {
    return undefined
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest(path, { body, authenticated = true, method = 'GET' } = {}) {
  if (!API_BASE_URL) {
    throw new Error('Configure VITE_API_URL para conectar à API.')
  }
  if (!path.startsWith('/') || !path.endsWith('/')) {
    throw new Error('Os caminhos da API devem começar e terminar com "/".')
  }

  const headers = new Headers({ Accept: 'application/json' })
  const token = authenticated ? getToken() : null

  if (token) {
    headers.set('Authorization', `Token ${token}`)
  }
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const responseBody = await readResponseBody(response)

  if (!response.ok) {
    if (response.status === 401) {
      clearSession()
    }
    throw new ApiError(response.status, responseBody)
  }

  return responseBody
}

export function createResourceService(resourcePath) {
  return {
    list: () => apiRequest(`/api/${resourcePath}/`),
    get: (id) => apiRequest(`/api/${resourcePath}/${encodeURIComponent(id)}/`),
    create: (data) => apiRequest(`/api/${resourcePath}/`, { method: 'POST', body: data }),
    update: (id, data) =>
      apiRequest(`/api/${resourcePath}/${encodeURIComponent(id)}/`, {
        method: 'PATCH',
        body: data,
      }),
    remove: (id) =>
      apiRequest(`/api/${resourcePath}/${encodeURIComponent(id)}/`, { method: 'DELETE' }),
  }
}

export function getApiErrorMessage(error, fallback) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Usuário ou senha inválidos.'
    }

    const body = error.body
    if (typeof body === 'string' && body.trim()) {
      return body
    }
    if (body && typeof body.detail === 'string') {
      return body.detail
    }
    if (body && typeof body === 'object') {
      const firstError = Object.values(body).flat()[0]
      if (typeof firstError === 'string') {
        return firstError
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
