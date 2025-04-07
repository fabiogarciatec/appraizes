// DatabaseContext.jsx
// Contexto para fornecer acesso ao serviço de API em toda a aplicação
// Implementa um provider que disponibiliza os métodos da API para acesso ao banco de dados

import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

// Criação do contexto
const DatabaseContext = createContext();

// Hook personalizado para usar o contexto
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase deve ser usado dentro de um DatabaseProvider');
  }
  return context;
};

// Provider do contexto
export const DatabaseProvider = ({ children }) => {
  // Estados para controlar o status da conexão
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStats, setConnectionStats] = useState(null);

  // Verifica o status da API quando o componente é montado
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('[DatabaseContext] Verificando status da API...');
        
        // Verifica o status da API usando ApiService
        const apiStatus = await ApiService.get('/api/status');
        console.log('[DatabaseContext] Status da API:', apiStatus);
        
        if (apiStatus && apiStatus.databaseConnection === 'connected') {
          setIsInitialized(true);
          console.log('[DatabaseContext] API conectada, obtendo estatísticas...');
          const stats = await ApiService.getDatabaseStats();
          console.log('[DatabaseContext] Estatísticas obtidas:', stats);
          setConnectionStats(stats);
        } else {
          console.warn('[DatabaseContext] API não está conectada ao banco de dados');
          setError('API não está conectada ao banco de dados');
        }
      } catch (err) {
        console.error('[DatabaseContext] Erro ao verificar status da API:', err);
        setError(err.message || 'Erro ao conectar à API');
      } finally {
        setIsLoading(false);
      }
    };

    // Verificar o status da API ao montar o componente
    checkApiStatus();
    
    // Configurar atualização periódica das estatísticas (a cada 30 segundos)
    const statsInterval = setInterval(() => {
      console.log('[DatabaseContext] Atualizando estatísticas periodicamente...');
      refreshConnectionStats();
    }, 30000); // 30 segundos
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(statsInterval);
  }, []);

  // Função para atualizar as estatísticas de conexão
  const refreshConnectionStats = async () => {
    try {
      // Tenta obter estatísticas mesmo se não estiver inicializado
      // Isso ajuda a recuperar de erros de conexão
      const stats = await ApiService.getDatabaseStats();
      
      if (stats) {
        // Se recebemos estatísticas, consideramos a conexão inicializada
        setIsInitialized(true);
        setConnectionStats(stats);
        setError(null);
        return stats;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      // Não alteramos o estado de inicialização aqui para evitar
      // que um erro temporário afete toda a interface
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Valor do contexto
  const contextValue = {
    // Status da conexão
    isInitialized,
    isLoading,
    error,
    connectionStats,
    refreshConnectionStats,
    
    // Serviços de usuários
    users: {
      authenticate: ApiService.login,
      getAll: ApiService.getAllUsers,
      create: ApiService.createUser,
      update: ApiService.updateUser,
      delete: ApiService.deleteUser
    },
    
    // Serviços de clientes
    clients: {
      getAll: ApiService.getAllClients,
      getById: ApiService.getClientById,
      create: ApiService.createClient,
      update: ApiService.updateClient,
      delete: ApiService.deleteClient,
      // Estes métodos serão implementados na API conforme necessário
      addHistory: async () => console.warn('Método não implementado na API'),
      getHistory: async () => console.warn('Método não implementado na API')
    },
    
    // Serviços de equipamentos
    equipments: {
      // Estes métodos serão implementados na API conforme necessário
      getAll: async () => console.warn('Método não implementado na API'),
      getByClient: async () => console.warn('Método não implementado na API'),
      create: async () => console.warn('Método não implementado na API'),
      update: async () => console.warn('Método não implementado na API'),
      delete: async () => console.warn('Método não implementado na API')
    },
    
    // Serviços de abastecimentos
    fuelRefills: {
      // Estes métodos serão implementados na API conforme necessário
      getByEquipment: async () => console.warn('Método não implementado na API'),
      create: async () => console.warn('Método não implementado na API')
    },
    
    // Serviços de peças
    parts: {
      // Estes métodos serão implementados na API conforme necessário
      getAllOfficial: async () => console.warn('Método não implementado na API'),
      getPopularNames: async () => console.warn('Método não implementado na API'),
      createOfficial: async () => console.warn('Método não implementado na API'),
      addPopularName: async () => console.warn('Método não implementado na API')
    },
    
    // Serviços de solicitações de orçamento
    quoteRequests: {
      // Estes métodos serão implementados na API conforme necessário
      getAll: async () => console.warn('Método não implementado na API'),
      create: async () => console.warn('Método não implementado na API'),
      updateStatus: async () => console.warn('Método não implementado na API')
    }
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export default DatabaseContext;
