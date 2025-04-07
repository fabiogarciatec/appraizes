import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar
} from '@mui/material';
import { 
  PendingActions, 
  CheckCircle, 
  LocalShipping, 
  Assignment,
  Add,
  ListAlt,
  Book,
  FindInPage,
  HourglassEmpty
} from '@mui/icons-material';
import { quoteRequests, clients } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import StyledCard from '../components/ui/StyledCard';

// Componente de card para estatísticas
const StatCard = ({ title, value, icon, color }) => (
  <StyledCard
    title={title}
    icon={icon}
    color={color}
    sx={{ width: '100%' }}
  >
    <Typography variant="h4" sx={{ mt: 2, fontWeight: 500 }}>
      {value}
    </Typography>
  </StyledCard>
);

// Componente para exibir solicitações recentes
const RecentRequests = ({ requests, navigate }) => {
  // Função para obter o nome do cliente pelo ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  // Função para obter a cor do chip de status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'identified': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'identified': return 'Identificada';
      case 'completed': return 'Concluída';
      default: return 'Desconhecido';
    }
  };

  return (
    <StyledCard title="Solicitações Recentes" sx={{ width: '100%', height: '100%' }}>
      <List sx={{ mt: 1, width: '100%' }}>
        {requests.length > 0 ? (
          requests.map((request) => (
            <Box key={request.id}>
              <ListItem
                secondaryAction={
                  <Chip 
                    label={getStatusText(request.status)} 
                    color={getStatusColor(request.status)} 
                    size="small" 
                    sx={{ fontWeight: 500 }}
                  />
                }
                sx={{ width: '100%', pr: 10 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {request.popularPartName}
                    </Typography>
                  }
                  secondary={`${getClientName(request.clientId)} - ${request.date}`}
                />
              </ListItem>
              <Divider component="li" />
            </Box>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="Nenhuma solicitação encontrada" />
          </ListItem>
        )}
      </List>
      <Box sx={{ mt: 2 }}>
        <Button 
          size="small" 
          onClick={() => navigate('/solicitacoes')}
          sx={{ fontWeight: 500 }}
        >
          Ver todas
        </Button>
      </Box>
    </StyledCard>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    identified: 0,
    completed: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const { currentUser } = useAuth();
  const { isInitialized: dbInitialized } = useDatabase();
  const navigate = useNavigate();
  
  // Função para obter o nome do cliente pelo ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  // Função para obter a cor do chip de status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'identified': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'identified': return 'Identificada';
      case 'completed': return 'Concluída';
      default: return 'Desconhecido';
    }
  };

  useEffect(() => {
    // Filtrar solicitações por usuário (simulando permissões)
    const filteredRequests = quoteRequests.filter(request => {
      // Se for admin, vê tudo
      if (currentUser?.role === 'admin') return true;
      // Se for cliente, vê apenas as próprias solicitações
      if (currentUser?.role === 'client') {
        return request.clientId === currentUser.id;
      }
      // Se for técnico, vê todas as solicitações
      return true;
    });

    // Calcular estatísticas
    const newStats = {
      total: filteredRequests.length,
      pending: filteredRequests.filter(r => r.status === 'pending').length,
      identified: filteredRequests.filter(r => r.status === 'identified').length,
      completed: filteredRequests.filter(r => r.status === 'completed').length
    };
    
    setStats(newStats);

    // Obter solicitações recentes (últimas 5)
    const recent = [...filteredRequests]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    setRecentRequests(recent);
  }, [currentUser]);

  return (
    <Box className="dashboard-container" sx={{ p: '4px 16px', width: '100%', boxSizing: 'border-box' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1, mt: 0 }}>
        Dashboard
      </Typography>
      
      {/* Cards estatísticos */}
      <Box sx={{ display: 'flex', width: '100%', flexWrap: 'nowrap', justifyContent: 'space-between', gap: '8px' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard 
            title="Total de Solicitações" 
            value={quoteRequests.length} 
            icon={<Assignment color="primary" />}
            color="primary"
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard 
            title="Pendentes" 
            value={stats.pending} 
            icon={<HourglassEmpty color="warning" />}
            color="warning"
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard 
            title="Identificadas" 
            value={stats.identified} 
            icon={<FindInPage color="info" />}
            color="info"
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard 
            title="Concluídas" 
            value={stats.completed} 
            icon={<LocalShipping color="success" />}
            color="success"
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          />
        </Box>
      </Box>
      

      
      {/* Ações Rápidas e Solicitações Recentes lado a lado */}
      <Box sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        {/* Ações Rápidas - À esquerda */}
        <Box sx={{ width: { xs: '100%', sm: '240px' }, flexShrink: 0 }}>
          <StyledCard title="Ações Rápidas" color="secondary" sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, height: '100%', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Add />}
                fullWidth
                onClick={() => navigate('/solicitacoes/nova')}
              >
                Nova Solicitação
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<ListAlt />}
                fullWidth
                onClick={() => navigate('/solicitacoes')}
              >
                Ver Solicitações
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                startIcon={<Book />}
                fullWidth
                onClick={() => navigate('/dicionario')}
              >
                Dicionário de Peças
              </Button>
            </Box>
          </StyledCard>
        </Box>
        
        {/* Solicitações Recentes - À direita, ocupando toda a área lateral livre */}
        <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'calc(100% - 256px)' } }}>
          <StyledCard title="Solicitações Recentes" sx={{ width: '100%', height: '100%' }}>
            <List sx={{ mt: 1, width: '100%' }}>
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <Box key={request.id}>
                    <ListItem
                      secondaryAction={
                        <Chip 
                          label={getStatusText(request.status)} 
                          color={getStatusColor(request.status)} 
                          size="small" 
                          sx={{ fontWeight: 500 }}
                        />
                      }
                      sx={{ width: '100%', pr: 10 }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {request.popularPartName}
                          </Typography>
                        }
                        secondary={`${getClientName(request.clientId)} - ${request.date}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </Box>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Nenhuma solicitação encontrada" />
                </ListItem>
              )}
            </List>
            <Box sx={{ mt: 2 }}>
              <Button 
                size="small" 
                onClick={() => navigate('/solicitacoes')}
                sx={{ fontWeight: 500 }}
              >
                Ver todas
              </Button>
            </Box>
          </StyledCard>
        </Box>
      </Box>
    </Box>
  );
}
