import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'
import { getApiErrorMessage } from '../services/api.js'
import { login as requestLogin, logout as requestLogout } from '../services/auth.js'
import { usuariosService } from '../services/usuarios.js'
import {
  clearSession,
  getToken,
  getUsername,
  LOGOUT_EVENT,
  saveSession,
} from '../services/session.js'

async function findUserByUsername(username) {
  const users = await usuariosService.list()
  return users.find((user) => user.username === username)
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const handleLogout = () => {
      if (active) {
        setToken(null)
        setUser(null)
      }
    }

    window.addEventListener(LOGOUT_EVENT, handleLogout)

    async function restoreSession() {
      await Promise.resolve()
      const savedToken = getToken()
      const username = getUsername()

      if (!savedToken || !username) {
        if (savedToken || username) {
          clearSession()
        }
        if (active) {
          setLoading(false)
        }
        return
      }

      setToken(savedToken)
      try {
        const restoredUser = await findUserByUsername(username)
        if (!active) {
          return
        }
        if (!restoredUser) {
          clearSession()
          setError('Não foi possível localizar o usuário desta sessão.')
          return
        }
        setUser(restoredUser)
      } catch (restoreError) {
        if (active) {
          setError(
            getApiErrorMessage(
              restoreError,
              'Não foi possível restaurar a sessão. Verifique a conexão com a API.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      active = false
      window.removeEventListener(LOGOUT_EVENT, handleLogout)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError('')

    try {
      const result = await requestLogin(username, password)
      if (!result?.token) {
        throw new Error('A API não retornou um token de autenticação.')
      }

      saveSession(result.token, username)
      setToken(result.token)

      const loggedInUser = await findUserByUsername(username)
      if (!loggedInUser) {
        clearSession()
        throw new Error('Não foi possível localizar o usuário após o login.')
      }

      setUser(loggedInUser)
      return true
    } catch (loginError) {
      setError(
        getApiErrorMessage(loginError, 'Não foi possível entrar. Tente novamente.'),
      )
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    requestLogout()
    setToken(null)
    setUser(null)
    setError('')
  }, [])

  const value = useMemo(
    () => ({ token, user, loading, error, login, logout }),
    [token, user, loading, error, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
