import {
  ChartNoAxesColumn,
  ChevronLeft,
  CircleHelp,
  LayoutDashboard,
  PackagePlus,
  Settings,
  Trash2,
  Boxes,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo-foodtrack.png'

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'Estoque', path: '/estoque', icon: Boxes },
  { label: 'Cadastrar Alimento', path: '/cadastrar-alimento', icon: PackagePlus },
  { label: 'Desperdícios', path: '/desperdicios', icon: Trash2 },
  { label: 'Relatórios', path: '/relatorios', icon: ChartNoAxesColumn },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
]

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex h-screen w-sidebar-width flex-col border-r border-border bg-surface">
      <div className="flex h-[104px] shrink-0 items-center px-4">
        <img
          alt="FoodTrack — Controle hoje, menos desperdício amanhã"
          className="h-[92px] w-44 object-contain"
          src={logo}
        />
      </div>

      <nav aria-label="Navegação principal" className="px-4 py-4">
        <ul className="flex flex-col gap-1.5">
          {navigationItems.map(({ label, path, icon: Icon, end }) => (
            <li key={path}>
              <NavLink
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-control px-4 text-body ${
                    isActive
                      ? 'bg-primary-soft font-semibold text-primary-strong'
                      : 'text-text-secondary hover:bg-field'
                  } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong`
                }
                end={end}
                to={path}
              >
                <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-border py-4">
        {/* TODO: Definir o destino de Suporte & Documentação. */}
        <a
          aria-disabled="true"
          className="flex min-h-11 cursor-not-allowed items-center gap-3 px-5 text-body text-text-secondary"
          tabIndex="-1"
        >
          <CircleHelp aria-hidden="true" className="size-[18px] shrink-0" />
          <span>Suporte &amp; Documentação</span>
        </a>
      </div>

      {/* TODO: Implementar recolhimento quando o estado e o layout recolhido forem definidos. */}
      <button
        aria-label="Recolher menu lateral"
        className="absolute right-0 top-8 flex size-8 translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>

      {/* TODO: Renderizar economia somente quando houver fonte de dados na API. */}
    </aside>
  )
}

export default Sidebar
