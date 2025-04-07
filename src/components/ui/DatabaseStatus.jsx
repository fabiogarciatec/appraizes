// DatabaseStatus.jsx
// Componente para exibir o status da conexão com o banco de dados
// Exibe informações sobre a conexão, estatísticas e permite testar a conexão

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  QueryStats as QueryStatsIcon,
  DataUsage as DataUsageIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import ApiService from '../../services/ApiService';

// Componente de status do banco de dados
export default function DatabaseStatus() {
  // Estados locais
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    isInitialized: false,
    isLoading: true,
    error: null,
    connectionStats: null
  });

  // Função para verificar o status da conexão com o banco de dados
  const checkDatabaseStatus = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, isLoading: true }));
      
      // Obter estatísticas de conexão
      const stats = await ApiService.getDatabaseStats();
      console.log('Estatísticas obtidas:', stats);
      
      // Verificar se as estatísticas são válidas
      if (stats && typeof stats === 'object') {
        setConnectionStatus({
          isInitialized: true,
          isLoading: false,
          error: null,
          connectionStats: stats
        });
      } else {
        console.error('Formato inválido de estatísticas:', stats);
        setConnectionStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Formato inválido de estatísticas'
        }));
      }
    } catch (error) {
      console.error('Erro ao verificar status do banco de dados:', error);
      setConnectionStatus({
        isInitialized: false,
        isLoading: false,
        error: error.message || 'Erro ao conectar ao banco de dados',
        connectionStats: null
      });
    }
  };
  
  // Atualiza as estatísticas quando o componente é montado
  useEffect(() => {
    checkDatabaseStatus();
    
    // Configura um intervalo para atualizar as estatísticas a cada 30 segundos
    const intervalId = setInterval(() => {
      checkDatabaseStatus();
    }, 30000); // 30 segundos
    
    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, []);

  // Função para testar a conexão com o banco de dados
  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestError(null);
      setTestResult(null);
      
      // Testar conexão via API
      const result = await ApiService.testDatabaseConnection();
      
      setTestResult(result);
      setTestError(null);
      
      // Atualiza as estatísticas após o teste
      checkDatabaseStatus();
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setTestError(error.message || 'Erro ao testar conexão');
      setTestResult(null);
    } finally {
      setIsTesting(false);
    }
  };

  // Função para atualizar manualmente as estatísticas
  const handleRefreshStats = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, isLoading: true }));
      console.log('Atualizando estatísticas manualmente...');
      await checkDatabaseStatus();
      console.log('Estatísticas atualizadas com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar estatísticas manualmente:', error);
      setConnectionStatus(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao atualizar estatísticas: ' + (error.message || 'Erro desconhecido')
      }));
    }
  };

  // Formata o tempo em milissegundos para uma string legível
  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Renderiza o status da conexão
  const renderConnectionStatus = () => {
    const { isLoading, error, isInitialized } = connectionStatus;
    
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Verificando conexão...</Typography>
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro de conexão: {error}
        </Alert>
      );
    }
    
    if (isInitialized) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography>API conectada ao banco de dados</Typography>
          <Chip 
            label="Online" 
            color="success" 
            size="small" 
            sx={{ ml: 1 }} 
          />
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorIcon color="warning" />
        <Typography>Conexão não inicializada</Typography>
        <Chip 
          label="Offline" 
          color="error" 
          size="small" 
          sx={{ ml: 1 }} 
        />
      </Box>
    );
  };

  // Renderiza as estatísticas de conexão
  const renderConnectionStats = () => {
    const { connectionStats } = connectionStatus;
    if (!connectionStats) return null;
    
    // Extrair estatísticas do objeto retornado pela API
    // A API pode retornar as estatísticas diretamente ou dentro de um objeto 'stats'
    const stats = connectionStats.stats || connectionStats;
    
    // Calcular a taxa de sucesso das consultas
    const totalQueries = stats.totalQueries || 0;
    const successRate = totalQueries > 0 
      ? Math.round((stats.successfulQueries / totalQueries) * 100) 
      : 100;
    
    // Determinar a cor do status com base na taxa de sucesso
    const getStatusColor = (rate) => {
      if (rate >= 95) return 'success';
      if (rate >= 80) return 'warning';
      return 'error';
    };
    
    const statusColor = getStatusColor(successRate);
    
    return (
      <List dense>
        <ListItem>
          <ListItemIcon>
            <QueryStatsIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight="medium">Consultas</Typography>
                <Chip 
                  size="small" 
                  color={statusColor} 
                  label={`${successRate}% sucesso`} 
                  variant="outlined"
                />
              </Box>
            } 
            secondary={
              <Typography variant="body2">
                Total: <strong>{stats.totalQueries || 0}</strong> | 
                Sucesso: <strong>{stats.successfulQueries || 0}</strong> | 
                Falhas: <strong>{stats.failedQueries || 0}</strong>
              </Typography>
            } 
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <SpeedIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={<Typography variant="subtitle2" fontWeight="medium">Tempo de Resposta</Typography>} 
            secondary={
              <Typography variant="body2">
                Média: <strong>{formatTime(stats.averageQueryTime || 0)}</strong> | 
                Última: <strong>{formatTime(stats.lastQueryTime || 0)}</strong>
              </Typography>
            } 
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <DataUsageIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={<Typography variant="subtitle2" fontWeight="medium">Erros de Conexão</Typography>} 
            secondary={
              <Typography variant="body2">
                {stats.lastError 
                  ? <span style={{ color: 'red' }}>Último erro: {stats.lastError}</span> 
                  : 'Nenhum erro registrado'}
              </Typography>
            } 
          />
        </ListItem>
        
        {/* Estatísticas do banco de dados */}
        {(stats.totalUsers !== undefined || stats.totalClients !== undefined) && (
          <ListItem>
            <ListItemIcon>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={<Typography variant="subtitle2" fontWeight="medium">Registros no Banco</Typography>} 
              secondary={
                <Typography variant="body2">
                  Usuários: <strong>{stats.totalUsers || 0}</strong> | 
                  Clientes: <strong>{stats.totalClients || 0}</strong> | 
                  Equipamentos: <strong>{stats.totalEquipments || 0}</strong>
                </Typography>
              } 
            />
          </ListItem>
        )}
      </List>
    );
  };

  // Renderiza o resultado do teste de conexão
  const renderTestResult = () => {
    if (!testResult) return null;
    
    return (
      <Alert 
        severity={testResult.success ? "success" : "error"}
        sx={{ mt: 2 }}
      >
        <Typography variant="body2" fontWeight="bold">
          {testResult.message}
        </Typography>
        <Typography variant="caption" display="block">
          Teste realizado em: {new Date(testResult.timestamp).toLocaleString()}
        </Typography>
      </Alert>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon color="primary" />
          <Typography variant="h6">Status do Banco de Dados</Typography>
        </Box>
        
        {connectionStatus.isLoading && (
          <CircularProgress size={20} thickness={5} />
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="outlined"
          color="info"
          size="small"
          onClick={handleRefreshStats}
          disabled={connectionStatus.isLoading}
          startIcon={<RefreshIcon />}
        >
          {connectionStatus.isLoading ? 'Atualizando...' : 'Atualizar Estatísticas'}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleTestConnection}
          disabled={isTesting || connectionStatus.isLoading}
          startIcon={<SyncIcon />}
        >
          {isTesting ? 'Testando...' : 'Testar Conexão'}
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Stack spacing={2}>
        {renderConnectionStatus()}
        
        {connectionStatus.isInitialized && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
              Estatísticas de Consultas
            </Typography>
            {renderConnectionStats()}
          </>
        )}
        
        {testError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {testError}
          </Alert>
        )}
        
        {renderTestResult()}
      </Stack>
    </Paper>
  );
}
