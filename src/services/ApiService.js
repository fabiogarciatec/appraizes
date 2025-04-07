// ApiService.js
// Serviço para comunicação com a API do backend
// Este arquivo centraliza todas as chamadas à API

// Constantes
// Determinar a URL base da API dinamicamente
const getBaseUrl = () => {
  // Se estiver em produção, use a mesma origem (mesmo domínio e porta)
  if (window.location.hostname !== 'localhost') {
    // Usar a mesma origem que o frontend para a API
    // Isso garante que funcione em qualquer ambiente de hospedagem, incluindo Docker
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    console.log(`Detectado ambiente de produção: ${protocol}//${hostname}${port}`);
    return `${protocol}//${hostname}${port}`;
  }
  
  // Em desenvolvimento, use localhost:3001 (servidor API local)
  console.log('Detectado ambiente de desenvolvimento: http://localhost:3001');
  return 'http://localhost:3001';
};

// Definir a URL base da API uma única vez na inicialização
const API_BASE_URL = getBaseUrl();
console.log(`URL base da API configurada para: ${API_BASE_URL}`);

// Classe ApiService para gerenciar todas as chamadas à API
class ApiService {
  // Método para construir a URL completa da API
  static getUrl(endpoint) {
    // Garante que o endpoint comece com /api/
    if (!endpoint.startsWith('/api/')) {
      endpoint = `/api${endpoint}`;
    }
    return `${API_BASE_URL}${endpoint}`;
  }

  // Método para realizar requisições GET
  static async get(endpoint) {
    const startTime = Date.now();
    const maxRetries = 2; // Número máximo de tentativas
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount <= maxRetries) {
      try {
        // Constrói a URL completa
        const url = this.getUrl(endpoint);
        console.log(`[${new Date().toISOString()}] Iniciando requisição GET para: ${url} (tentativa ${retryCount + 1}/${maxRetries + 1})`);
        
        // Realiza a requisição
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          cache: 'no-cache',
          // Adiciona um timeout para evitar que a requisição fique pendente indefinidamente
          signal: AbortSignal.timeout(10000) // 10 segundos de timeout
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Resposta recebida de ${endpoint}: status=${response.status}, tempo=${responseTime}ms`);
        
        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
          const errorText = await response.text();
          let errorData = {};
          
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            console.log('Resposta não é JSON válido:', errorText);
          }
          
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        // Processa a resposta
        const data = await response.json();
        console.log(`[${new Date().toISOString()}] Dados recebidos de ${endpoint}:`, data);
        return data;
      } catch (error) {
        const errorTime = Date.now() - startTime;
        lastError = error;
        
        // Verifica se é um erro de conexão ou timeout
        const isConnectionError = 
          error.name === 'TypeError' || 
          error.name === 'AbortError' || 
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError');
        
        console.error(`[${new Date().toISOString()}] Erro na requisição GET para ${endpoint} após ${errorTime}ms (tentativa ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // Se for um erro de conexão e ainda temos tentativas, tenta novamente
        if (isConnectionError && retryCount < maxRetries) {
          retryCount++;
          const retryDelay = 1000 * retryCount; // Espera progressiva (1s, 2s)
          console.log(`Tentando novamente em ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // Se chegou aqui, lança o erro para ser tratado pelo chamador
        throw error;
      }
    }
  }

  // Método para realizar requisições POST
  static async post(endpoint, data) {
    const startTime = Date.now();
    const maxRetries = 2; // Número máximo de tentativas
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        const url = this.getUrl(endpoint);
        console.log(`[${new Date().toISOString()}] Iniciando requisição POST para: ${url} (tentativa ${retryCount + 1}/${maxRetries + 1})`, data);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          cache: 'no-cache',
          body: JSON.stringify(data),
          // Adiciona um timeout para evitar que a requisição fique pendente indefinidamente
          signal: AbortSignal.timeout(10000) // 10 segundos de timeout
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Resposta recebida de ${endpoint}: status=${response.status}, tempo=${responseTime}ms`);
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData = {};
          
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            console.log('Resposta não é JSON válido:', errorText);
          }
          
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log(`[${new Date().toISOString()}] Dados recebidos de ${endpoint}:`, responseData);
        return responseData;
      } catch (error) {
        const errorTime = Date.now() - startTime;
        
        // Verifica se é um erro de conexão ou timeout
        const isConnectionError = 
          error.name === 'TypeError' || 
          error.name === 'AbortError' || 
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError');
        
        console.error(`[${new Date().toISOString()}] Erro na requisição POST para ${endpoint} após ${errorTime}ms (tentativa ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // Se for um erro de conexão e ainda temos tentativas, tenta novamente
        if (isConnectionError && retryCount < maxRetries) {
          retryCount++;
          const retryDelay = 1000 * retryCount; // Espera progressiva (1s, 2s)
          console.log(`Tentando novamente em ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // Se chegou aqui, lança o erro para ser tratado pelo chamador
        throw error;
      }
    }
  }

  // Método para realizar requisições PUT
  static async put(endpoint, data) {
    const startTime = Date.now();
    const maxRetries = 2; // Número máximo de tentativas
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        const url = this.getUrl(endpoint);
        console.log(`[${new Date().toISOString()}] Iniciando requisição PUT para: ${url} (tentativa ${retryCount + 1}/${maxRetries + 1})`, data);
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          cache: 'no-cache',
          body: JSON.stringify(data),
          // Adiciona um timeout para evitar que a requisição fique pendente indefinidamente
          signal: AbortSignal.timeout(10000) // 10 segundos de timeout
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Resposta recebida de ${endpoint}: status=${response.status}, tempo=${responseTime}ms`);
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData = {};
          
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            console.log('Resposta não é JSON válido:', errorText);
          }
          
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log(`[${new Date().toISOString()}] Dados recebidos de ${endpoint}:`, responseData);
        return responseData;
      } catch (error) {
        const errorTime = Date.now() - startTime;
        
        // Verifica se é um erro de conexão ou timeout
        const isConnectionError = 
          error.name === 'TypeError' || 
          error.name === 'AbortError' || 
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError');
        
        console.error(`[${new Date().toISOString()}] Erro na requisição PUT para ${endpoint} após ${errorTime}ms (tentativa ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // Se for um erro de conexão e ainda temos tentativas, tenta novamente
        if (isConnectionError && retryCount < maxRetries) {
          retryCount++;
          const retryDelay = 1000 * retryCount; // Espera progressiva (1s, 2s)
          console.log(`Tentando novamente em ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // Se chegou aqui, lança o erro para ser tratado pelo chamador
        throw error;
      }
    }
  }

  // Método para realizar requisições DELETE
  static async delete(endpoint) {
    const startTime = Date.now();
    const maxRetries = 2; // Número máximo de tentativas
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        // Constrói a URL completa
        const url = this.getUrl(endpoint);
        console.log(`[${new Date().toISOString()}] Iniciando requisição DELETE para: ${url} (tentativa ${retryCount + 1}/${maxRetries + 1})`);
        
        // Realiza a requisição
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors',
          cache: 'no-cache',
          // Adiciona um timeout para evitar que a requisição fique pendente indefinidamente
          signal: AbortSignal.timeout(10000) // 10 segundos de timeout
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Resposta recebida de ${endpoint}: status=${response.status}, tempo=${responseTime}ms`);
        
        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
          const errorText = await response.text();
          let errorData = {};
          
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            console.log('Resposta não é JSON válido:', errorText);
          }
          
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        // Processa a resposta (algumas requisições DELETE podem não retornar conteúdo)
        let responseData = {};
        try {
          responseData = await response.json();
        } catch (e) {
          // Se não for JSON, retorna um objeto vazio
          console.log('Resposta não é JSON, provavelmente vazia');
        }
        
        console.log(`[${new Date().toISOString()}] Dados recebidos de ${endpoint}:`, responseData);
        return responseData;
      } catch (error) {
        const errorTime = Date.now() - startTime;
        
        // Verifica se é um erro de conexão ou timeout
        const isConnectionError = 
          error.name === 'TypeError' || 
          error.name === 'AbortError' || 
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError');
        
        console.error(`[${new Date().toISOString()}] Erro na requisição DELETE para ${endpoint} após ${errorTime}ms (tentativa ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // Se for um erro de conexão e ainda temos tentativas, tenta novamente
        if (isConnectionError && retryCount < maxRetries) {
          retryCount++;
          const retryDelay = 1000 * retryCount; // Espera progressiva (1s, 2s)
          console.log(`Tentando novamente em ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // Se chegou aqui, lança o erro para ser tratado pelo chamador
        throw error;
      }
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DE AUTENTICAÇÃO =====
  
  // Login de usuário
  static async login(username, password) {
    try {
      const response = await this.post('/api/auth/login', { username, password });
      return response.user;
    } catch (error) {
      console.error('Erro durante login:', error);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DE BANCO DE DADOS =====
  
  // Método para testar a conexão com o banco de dados
  static async testDatabaseConnection() {
    try {
      const result = await this.get('/api/database/test');
      console.log('Resultado do teste de conexão:', result);
      return result;
    } catch (error) {
      console.error('Erro ao testar conexão com o banco de dados:', error);
      // Retornando um objeto com status de erro para evitar quebrar a interface
      return { success: false, message: error.message };
    }
  }
  
  // Obter estatísticas de conexão com o banco de dados
  static async getDatabaseStats() {
    try {
      const response = await this.get('/api/database/stats');
      console.log('Resposta de estatísticas do banco de dados:', response);
      
      // A API pode retornar as estatísticas diretamente ou dentro de um objeto
      const stats = response.stats || response;
      
      // Garantir que todas as propriedades esperadas existam
      return {
        totalQueries: stats.totalQueries || 0,
        successfulQueries: stats.successfulQueries || 0,
        failedQueries: stats.failedQueries || 0,
        lastQueryTime: stats.lastQueryTime || 0,
        averageQueryTime: stats.averageQueryTime || 0,
        lastError: stats.lastError || null,
        // Incluir outras estatísticas que possam ser úteis
        totalUsers: stats.totalUsers || 0,
        totalClients: stats.totalClients || 0,
        totalEquipments: stats.totalEquipments || 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do banco de dados:', error);
      // Retornando um objeto vazio para evitar quebrar a interface
      return {
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        lastQueryTime: 0,
        averageQueryTime: 0,
        lastError: null
      };
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DE USUÁRIOS =====
  
  // Listar todos os usuários
  static async getAllUsers() {
    try {
      // Fazendo a requisição diretamente para a API
      const response = await fetch('http://localhost:3001/api/users');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const users = await response.json();
      console.log('Usuários recebidos:', users ? users.length : 0);
      return users;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      // Retornando um array vazio para evitar erros na interface
      return [];
    }
  }
  
  // Obter um usuário específico
  static async getUserById(id) {
    try {
      return await this.get(`/users/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw error;
    }
  }
  
  // Criar um novo usuário
  static async createUser(userData) {
    try {
      return await this.post('/users', userData);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }
  
  // Atualizar um usuário existente
  static async updateUser(id, userData) {
    try {
      // Fazendo a requisição diretamente para a API
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Usuário ${id} atualizado com sucesso:`, result);
      return result;
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      // Retornando o objeto original para evitar erros na interface
      return { ...userData, id };
    }
  }
  
  // Excluir um usuário
  static async deleteUser(id) {
    try {
      return await this.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir usuário ${id}:`, error);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DE CLIENTES =====
  
  // Listar todos os clientes
  static async getAllClients() {
    try {
      // Fazendo a requisição diretamente para a API
      const response = await fetch('http://localhost:3001/api/clients');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const clients = await response.json();
      console.log('Clientes recebidos:', clients ? clients.length : 0);
      return clients;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      // Retornando um array vazio para evitar erros na interface
      return [];
    }
  }
  
  // Obter um cliente específico
  static async getClientById(id) {
    try {
      return await this.get(`/clients/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw error;
    }
  }
  
  // Criar um novo cliente
  static async createClient(clientData) {
    try {
      return await this.post('/clients', clientData);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }
  
  // Atualizar um cliente existente
  static async updateClient(id, clientData) {
    try {
      // Fazendo a requisição diretamente para a API usando a URL base
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Cliente ${id} atualizado com sucesso:`, result);
      return result;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      // Retornando o objeto original para evitar erros na interface
      return { ...clientData, id };
    }
  }
  
  // Excluir um cliente
  static async deleteClient(id) {
    try {
      return await this.delete(`/clients/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir cliente ${id}:`, error);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DE EQUIPAMENTOS =====
  
  // Listar todos os equipamentos
  static async getAllEquipments() {
    try {
      // Fazendo a requisição diretamente para a API
      const response = await fetch('http://localhost:3001/api/equipments');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const equipments = await response.json();
      console.log('Equipamentos recebidos:', equipments ? equipments.length : 0);
      return equipments;
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      // Retornando um array vazio para evitar erros na interface
      return [];
    }
  }
  
  // Obter um equipamento específico
  static async getEquipmentById(id) {
    try {
      return await this.get(`/equipments/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar equipamento ${id}:`, error);
      throw error;
    }
  }
  
  // Criar um novo equipamento
  static async createEquipment(equipmentData) {
    try {
      return await this.post('/equipments', equipmentData);
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
      throw error;
    }
  }
  
  // Atualizar um equipamento existente
  static async updateEquipment(id, equipmentData) {
    try {
      // Fazendo a requisição diretamente para a API usando a URL base
      const response = await fetch(`${API_BASE_URL}/api/equipments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Equipamento ${id} atualizado com sucesso:`, result);
      return result;
    } catch (error) {
      console.error(`Erro ao atualizar equipamento ${id}:`, error);
      // Retornando o objeto original para evitar erros na interface
      return { ...equipmentData, id };
    }
  }
  
  // Excluir um equipamento
  static async deleteEquipment(id) {
    try {
      return await this.delete(`/equipments/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir equipamento ${id}:`, error);
      throw error;
    }
  }
  
  // Listar todos os modelos de máquinas
  static async getAllMachineModels() {
    try {
      console.log('Buscando modelos de máquinas...');
      
      // Fazendo a requisição diretamente para a API
      const response = await fetch('http://localhost:3001/api/machine-models');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const models = await response.json();
      console.log('Modelos recebidos:', models ? models.length : 0);
      console.log('Estrutura do primeiro modelo:', models && models.length > 0 ? JSON.stringify(models[0]) : 'nenhum modelo');
      return models;
    } catch (error) {
      console.error('Erro ao buscar modelos de máquinas:', error);
      
      // Retornando um array vazio para evitar erros na interface
      return [];
    }
  }
  
  // Listar todas as famílias de máquinas
  static async getAllMachineFamilies() {
    try {
      // Fazendo a requisição diretamente para a API
      const response = await fetch('http://localhost:3001/api/machine-families');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const families = await response.json();
      console.log('Famílias recebidas:', families ? families.length : 0);
      return families;
    } catch (error) {
      console.error('Erro ao buscar famílias de máquinas:', error);
      // Retornando um array vazio para evitar erros na interface
      return [];
    }
  }
}

export default ApiService;
