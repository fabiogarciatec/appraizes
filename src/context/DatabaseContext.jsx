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
        
        // Verifica o status da API
        const apiStatus = await ApiService.get('/status');
        
        if (apiStatus.databaseConnection === 'connected') {
          setIsInitialized(true);
          
          // Obtém estatísticas da conexão
          const stats = await ApiService.getDatabaseStats();
          setConnectionStats(stats);
          
          console.log('API conectada ao banco de dados com sucesso');
        } else {
          setError('API não está conectada ao banco de dados');
        }
      } catch (err) {
        console.error('Erro ao verificar status da API:', err);
        setError(err.message || 'Erro ao conectar à API');
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();
  }, []);

  // Função para atualizar as estatísticas de conexão
  const refreshConnectionStats = async () => {
    try {
      if (isInitialized) {
        const stats = await ApiService.getDatabaseStats();
        setConnectionStats(stats);
        return stats;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      return null;
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
