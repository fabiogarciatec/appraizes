// ApiService.js
// Serviço para comunicação com a API do backend
// Este arquivo centraliza todas as chamadas à API

// Constantes
// Determinar a URL base da API dinamicamente
const getBaseUrl = () => {
  // Em desenvolvimento, use sempre o mesmo protocolo e host que a página atual
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Use o mesmo hostname que a página atual para evitar problemas de CORS
    const devApiUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
    console.log(`Detectado ambiente de desenvolvimento: ${devApiUrl}`);
    return devApiUrl;
  }
  
  // Em produção, use a URL baseada no hostname atual
  const productionApiUrl = `https://${window.location.hostname}`;
  console.log(`Detectado ambiente de produção: ${productionApiUrl}`);
  return productionApiUrl;
};

// Definir a URL base da API uma única vez na inicialização
const API_BASE_URL = getBaseUrl();
console.log(`URL base da API configurada para: ${API_BASE_URL}`);

// Classe ApiService para gerenciar todas as chamadas à API
class ApiService {
  // Método para construir a URL completa da API
  static getUrl(endpoint) {
    // Garante que endpoint seja uma string
    if (!endpoint) endpoint = '';
    
    // Garante que o endpoint comece com /api/
    if (!endpoint.startsWith('/api/')) {
      if (endpoint.startsWith('/')) {
        endpoint = `/api${endpoint}`;
      } else {
        endpoint = `/api/${endpoint}`;
      }
    }
    
    const finalUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`URL final: ${finalUrl}`);
    return finalUrl;
  }

  // Método para realizar requisições GET
  static async get(endpoint) {
    try {
      // Constrói a URL completa
      const url = this.getUrl(endpoint);
      console.log(`Iniciando requisição GET para: ${url}`);
      
      // Realiza a requisição com timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'same-origin',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Resposta recebida de ${endpoint}:`, response.status);
      
      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      // Processa a resposta
      const data = await response.json();
      console.log(`Dados recebidos de ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`Erro na requisição GET para ${endpoint}:`, error);
      
      // Para o endpoint de status, retorna um objeto vazio para evitar quebrar a aplicação
      if (endpoint === '/api/status' || endpoint.includes('status')) {
        console.warn('Retornando objeto de status de erro');
        return { status: 'error', error: error.message, timestamp: new Date().toISOString() };
      }
      
      throw error;
    }
  }

  // Método para realizar requisições POST
  static async post(endpoint, data) {
    try {
      const url = this.getUrl(endpoint);
      console.log(`Iniciando requisição POST para: ${url}`, data);
      
      // Realiza a requisição com timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify(data)
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Resposta recebida de ${endpoint}:`, response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log(`Dados recebidos de ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Erro na requisição POST para ${endpoint}:`, error);
      throw error;
    }
  }

  // Método para realizar requisições PUT
  static async put(endpoint, data) {
    try {
      const url = this.getUrl(endpoint);
      console.log(`Iniciando requisição PUT para: ${url}`, data);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(data)
      });
      
      console.log(`Resposta recebida de ${endpoint}:`, response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log(`Dados recebidos de ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Erro na requisição PUT para ${endpoint}:`, error);
      throw error;
    }
  }

  // Método para realizar requisições DELETE
  static async delete(endpoint) {
    try {
      const url = this.getUrl(endpoint);
      console.log(`Iniciando requisição DELETE para: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      console.log(`Resposta recebida de ${endpoint}:`, response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      // Tenta processar a resposta como JSON, mas aceita respostas vazias
      let data = {};
      const responseText = await response.text();
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.log('Resposta não é JSON válido, mas isso é aceitável para DELETE:', responseText);
        }
      }
      
      console.log(`Operação DELETE concluída para ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`Erro na requisição DELETE para ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos específicos para endpoints comuns
  
  // Verificar status da API
  static async getApiStatus() {
    return this.get('/api/status');
  }
  
  // Testar conexão com o banco de dados
  static async testDatabaseConnection() {
    return this.get('/api/database/test');
  }
  
  // Obter estatísticas do banco de dados
  static async getDatabaseStats() {
    return this.get('/api/database/stats');
  }
  
  // Obter todos os clientes
  static async getAllClients() {
    return this.get('/api/clients');
  }
  
  // Obter um cliente específico por ID
  static async getClientById(id) {
    return this.get(`/api/clients/${id}`);
  }
  
  // Criar um novo cliente
  static async createClient(clientData) {
    return this.post('/api/clients', clientData);
  }
  
  // Atualizar um cliente existente
  static async updateClient(id, clientData) {
    return this.put(`/api/clients/${id}`, clientData);
  }
  
  // Excluir um cliente
  static async deleteClient(id) {
    return this.delete(`/api/clients/${id}`);
  }
  // ===== MÉTODOS ESPECÍFICOS DE EQUIPAMENTOS =====
  
  // Listar todos os equipamentos
  static async getAllEquipments() {
    return this.get('/api/equipments');
  }
  
  // Obter um equipamento específico
  static async getEquipmentById(id) {
    return this.get(`/api/equipments/${id}`);
  }
  
  // Criar um novo equipamento
  static async createEquipment(equipmentData) {
    return this.post('/api/equipments', equipmentData);
  }
  
  // Atualizar um equipamento existente
  static async updateEquipment(id, equipmentData) {
    return this.put(`/api/equipments/${id}`, equipmentData);
  }
  
  // Excluir um equipamento
  static async deleteEquipment(id) {
    return this.delete(`/api/equipments/${id}`);
  }
  
  // Listar todos os modelos de máquinas
  static async getAllMachineModels() {
    return this.get('/api/machine-models');
  }
  
  // Listar todas as famílias de máquinas
  static async getAllMachineFamilies() {
    return this.get('/api/machine-families');
  }
  
  // ===== MÉTODOS ESPECÍFICOS DE USUÁRIOS =====
  
  // Obter todos os usuários
  static async getAllUsers() {
    return this.get('/api/users');
  }
  
  // Obter um usuário específico por ID
  static async getUserById(id) {
    return this.get(`/api/users/${id}`);
  }
  
  // Criar um novo usuário
  static async createUser(userData) {
    return this.post('/api/users', userData);
  }
  
  // Atualizar um usuário existente
  static async updateUser(id, userData) {
    return this.put(`/api/users/${id}`, userData);
  }
  
  // Excluir um usuário
  static async deleteUser(id) {
    return this.delete(`/api/users/${id}`);
  }
  
  // Autenticar usuário (login)
  static async login(credentials) {
    return this.post('/api/auth/login', credentials);
  }
}

export default ApiService;
