import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Contexto de autenticação
import { AuthProvider, useAuth } from './context/AuthContext'

// Componentes de layout
import Layout from './components/layout/Layout'

// Páginas
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import QuoteRequests from './pages/QuoteRequests'
import NewQuoteRequest from './pages/NewQuoteRequest'
import IdentifyPart from './pages/IdentifyPart'
import PartDictionary from './pages/PartDictionary'
import ClientHistory from './pages/ClientHistory'
import NotFound from './pages/NotFound'

// Estilos globais
import './App.css'

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div>Carregando...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return children
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f57c00',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

function App() {
  // Aplicar estilos globais para garantir que o conteúdo ocupe toda a largura
  useEffect(() => {
    // Remover margens e paddings do documento
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.width = '100vw';
    document.documentElement.style.maxWidth = '100vw';
    document.documentElement.style.overflow = 'hidden';
    
    // Aplicar estilos ao body
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100vw';
    document.body.style.maxWidth = '100vw';
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Limpar estilos ao desmontar
      document.documentElement.style = '';
      document.body.style = '';
    };
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="solicitacoes" element={<QuoteRequests />} />
              <Route path="solicitacoes/nova" element={<NewQuoteRequest />} />
              <Route path="solicitacoes/:id/identificar" element={<IdentifyPart />} />
              <Route path="dicionario" element={<PartDictionary />} />
              <Route path="clientes/:id/historico" element={<ClientHistory />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
