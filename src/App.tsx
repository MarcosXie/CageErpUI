import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthProvider from './auth/AuthProvider'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import CageOutsPage from './pages/CageOutsPage'
import CageOutsReportPage from './pages/CageOutsReportPage'
import ClientesPage from './pages/ClientesPage'
import FuncionariosPage from './pages/FuncionariosPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProdutosPage from './pages/ProdutosPage'
import RejeitosPage from './pages/RejeitosPage'
import UnidadesPage from './pages/UnidadesPage'
import VendasPage from './pages/VendasPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="unidades" element={<UnidadesPage />} />
              <Route path="funcionarios" element={<FuncionariosPage />} />
              <Route path="cageouts" element={<CageOutsPage />} />
              <Route path="produtos" element={<ProdutosPage />} />
              <Route path="relatorios/vendas" element={<VendasPage />} />
              <Route path="relatorios/rejeitos" element={<RejeitosPage />} />
              <Route path="relatorios/cageouts" element={<CageOutsReportPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
