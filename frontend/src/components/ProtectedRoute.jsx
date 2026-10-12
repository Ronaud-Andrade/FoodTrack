import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function ProtectedRoute() {
  const { token, user, loading, error, logout } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-content-x py-content-y">
        <p className="text-body text-text-secondary">Carregando sessão...</p>
      </main>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-content-x py-content-y">
        <section className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-card">
          <p className="text-body text-danger" role="alert">
            {error || 'Não foi possível validar a sessão.'}
          </p>
          <button
            className="mt-6 min-h-interactive-min rounded-control bg-primary px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            onClick={logout}
            type="button"
          >
            Sair
          </button>
        </section>
      </main>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
