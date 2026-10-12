const TOKEN_KEY = 'foodtrack.token'
const USERNAME_KEY = 'foodtrack.username'
export const LOGOUT_EVENT = 'foodtrack:logout'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY)
}

export function saveSession(token, username) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  window.dispatchEvent(new Event(LOGOUT_EVENT))
}
