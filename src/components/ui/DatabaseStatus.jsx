// DatabaseStatus.jsx
// Componente para exibir o status da conexão com o banco de dados
// Exibe informações sobre a conexão, estatísticas e permite testar a conexão

import React, { useState, useEffect } from 'react';
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
  DataUsage as DataUsageIcon
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

  // Efeito para verificar o status da conexão com o banco de dados quando o componente é montado
  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        setConnectionStatus(prev => ({ ...prev, isLoading: true }));
        
        // Obter estatísticas de conexão
        const stats = await ApiService.getDatabaseStats();
        
        setConnectionStatus({
          isInitialized: true,
          isLoading: false,
          error: null,
          connectionStats: stats
        });
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
    
    checkDatabaseStatus();
  }, []);

  // Função para testar a conexão com o banco de dados
  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestError(null);
      setTestResult(null);
      
      // Testar conexão via API
      const result = await ApiService.testDatabaseConnection();
      
      // Atualizar estatísticas de conexão
      const stats = await ApiService.getDatabaseStats();
      setConnectionStatus(prev => ({
        ...prev,
        connectionStats: stats,
        isInitialized: true,
        error: null
      }));
      
      setTestResult({
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
        stats: result.stats,
        tables: result.tables
      });
    } catch (err) {
      setTestError(err.message || 'Erro desconhecido ao testar conexão');
      setTestResult({
        success: false,
        message: 'Falha ao testar conexão com o banco de dados',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTesting(false);
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
    
    return (
      <List dense>
        <ListItem>
          <ListItemIcon>
            <QueryStatsIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Consultas" 
            secondary={`Total: ${connectionStats.totalQueries || 0} | Sucesso: ${connectionStats.successfulQueries || 0} | Falhas: ${connectionStats.failedQueries || 0}`} 
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <SpeedIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Tempo de Resposta" 
            secondary={`Média: ${formatTime(connectionStats.averageQueryTime || 0)} | Última: ${formatTime(connectionStats.lastQueryTime || 0)}`} 
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <DataUsageIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Erros de Conexão" 
            secondary={(connectionStats.connectionErrors || 0) > 0 
              ? `Total: ${connectionStats.connectionErrors} | Último: ${connectionStats.lastError} (${connectionStats.lastErrorTime ? new Date(connectionStats.lastErrorTime).toLocaleString() : 'N/A'})` 
              : 'Nenhum erro registrado'
            } 
          />
        </ListItem>
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
        
        <Button
          variant="outlined"
          size="small"
          startIcon={isTesting ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={handleTestConnection}
          disabled={isTesting || connectionStatus.isLoading}
        >
          {isTesting ? 'Testando...' : 'Testar Conexão'}
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Stack spacing={2}>
        {renderConnectionStatus()}
        
        {connectionStatus.isInitialized && (
          <>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Estatísticas de Conexão
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
