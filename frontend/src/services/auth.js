import { apiRequest } from './api.js'
import { clearSession } from './session.js'

export function login(username, password) {
  return apiRequest('/api/token/', {
    authenticated: false,
    body: { username, password },
    method: 'POST',
  })
}

export function logout() {
  clearSession()
}
