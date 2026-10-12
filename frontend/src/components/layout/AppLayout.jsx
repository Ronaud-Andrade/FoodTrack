import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

function AppLayout() {
  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-text-primary focus:shadow-panel focus:outline-2 focus:outline-offset-2 focus:outline-primary-strong"
        href="#main-content"
      >
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="ml-sidebar-width min-h-screen bg-page">
        <Header />
        <main
          className="mx-auto min-h-[calc(100vh-var(--spacing-header-height))] w-full max-w-content px-content-x py-content-y"
          id="main-content"
          tabIndex="-1"
        >
          <Outlet />
        </main>
      </div>
    </>
  )
}

export default AppLayout
