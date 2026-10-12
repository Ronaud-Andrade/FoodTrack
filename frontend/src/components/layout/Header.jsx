import { Bell, LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

function getDisplayName(user) {
  return user?.nome?.trim() || user?.username || ''
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toLocaleUpperCase('pt-BR')
}

function Header() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = getDisplayName(user)
  const profile = user?.perfil?.trim()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-header-height items-center gap-3 border-b border-border bg-white/95 px-content-x backdrop-blur-[12px]">
      <div className="relative flex w-full max-w-2xl flex-1 items-center">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 size-[18px] text-text-secondary"
        />
        {/* TODO: Conectar a busca quando a API oferecer um endpoint ou parâmetro de busca. */}
        <input
          aria-label="Buscar"
          className="h-11 w-full rounded-control border border-border bg-field pl-11 pr-4 text-body text-text-primary placeholder:text-text-primary/50 disabled:cursor-not-allowed disabled:opacity-100"
          disabled
          placeholder="Buscar insumo, câmara, lote..."
          type="search"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <button
          aria-label="Notificações de validade"
          className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text-secondary disabled:cursor-not-allowed disabled:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
          disabled
          type="button"
        >
          <Bell aria-hidden="true" className="size-5" />
        </button>

        {loading || !user ? (
          <div aria-label="Carregando usuário" className="h-10 w-40 rounded-control bg-field" />
        ) : (
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-progress-track text-caption font-bold text-text-secondary"
            >
              {getInitials(displayName)}
            </div>
            <div className="max-w-48">
              <p className="truncate text-body-small font-semibold text-text-primary">
                {displayName}
              </p>
              {profile && (
                <p className="truncate text-caption text-text-muted">{profile}</p>
              )}
            </div>
            <button
              aria-label="Sair"
              className="flex size-10 items-center justify-center rounded-control text-text-secondary hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
              onClick={handleLogout}
              type="button"
            >
              <LogOut aria-hidden="true" className="size-[18px]" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
