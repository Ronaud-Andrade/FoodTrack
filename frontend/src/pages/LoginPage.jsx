import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function LoginPage() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const authenticated = await login(username, password)
    if (authenticated) {
      navigate('/', { replace: true })
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-content-x py-content-y">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-card"
      >
        <h1
          className="text-page-title font-bold tracking-page-title text-text-primary"
          id="login-title"
        >
          FoodTrack
        </h1>
        <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-body-small font-semibold text-text-primary" htmlFor="username">
              Usuário
            </label>
            <input
              autoComplete="username"
              className="min-h-interactive-min rounded-control border border-border bg-field px-4 text-body text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
              id="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-body-small font-semibold text-text-primary" htmlFor="password">
              Senha
            </label>
            <input
              autoComplete="current-password"
              className="min-h-interactive-min rounded-control border border-border bg-field px-4 text-body text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error && (
            <p
              className="rounded-control border border-danger-border bg-danger-bg px-4 py-3 text-body-small text-danger"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            className="min-h-interactive-min rounded-control bg-primary px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
