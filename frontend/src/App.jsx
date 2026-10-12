import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import CadastrarAlimentoPage from './pages/CadastrarAlimentoPage.jsx'
import ConfiguracoesPage from './pages/ConfiguracoesPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DesperdiciosPage from './pages/DesperdiciosPage.jsx'
import EstoquePage from './pages/EstoquePage.jsx'
import ItensPrioritariosPage from './pages/ItensPrioritariosPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RelatoriosPage from './pages/RelatoriosPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="estoque" element={<EstoquePage />} />
          <Route path="cadastrar-alimento" element={<CadastrarAlimentoPage />} />
          <Route path="desperdicios" element={<DesperdiciosPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="itens-prioritarios" element={<ItensPrioritariosPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
