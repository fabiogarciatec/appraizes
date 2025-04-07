// ApiService.js
// Serviço para comunicação com a API do backend
// Este arquivo centraliza todas as chamadas à API

// Constantes
// Determinar a URL base da API dinamicamente
const getBaseUrl = () => {
  // Se estiver em produção, use o domínio atual
  if (window.location.hostname !== 'localhost') {
    return `https://${window.location.hostname}/api`;
  }
  // Em desenvolvimento, use localhost
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getBaseUrl();

// Classe ApiService para gerenciar todas as chamadas à API
class ApiService {
  // Método para construir a URL completa da API
  static getUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
  }

  // Método para realizar requisições GET
  static async get(endpoint) {
    try {
      console.log(`Iniciando requisição GET para: ${this.getUrl(endpoint)}`);
      
      const response = await fetch(this.getUrl(endpoint), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      console.log(`Resposta recebida de ${endpoint}:`, response.status);
      
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
      
      const data = await response.json();
      console.log(`Dados recebidos de ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`Erro na requisição GET para ${endpoint}:`, error);
      throw error;
    }
  }

  // Método para realizar requisições POST
  static async post(endpoint, data) {
    try {
      const response = await fetch(this.getUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição POST para ${endpoint}:`, error);
      throw error;
    }
  }

  // Método para realizar requisições PUT
  static async put(endpoint, data) {
    try {
      const response = await fetch(this.getUrl(endpoint), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição PUT para ${endpoint}:`, error);
      throw error;
    }
  }

  // Método para realizar requisições DELETE
  static async delete(endpoint) {
    try {
      const response = await fetch(this.getUrl(endpoint), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição DELETE para ${endpoint}:`, error);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DE AUTENTICAÇÃO =====
  
  // Login de usuário
  static async login(username, password) {
    try {
      const response = await this.post('/auth/login', { username, password });
      return response.user;
    } catch (error) {
      console.error('Erro durante login:', error);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DE BANCO DE DADOS =====
  
  // Testar conexão com o banco de dados
  static async testDatabaseConnection() {
    try {
      return await this.get('/database/test');
    } catch (error) {
      console.error('Erro ao testar conexão com o banco de dados:', error);
      throw error;
    }
  }
  
  // Obter estatísticas de conexão com o banco de dados
  static async getDatabaseStats() {
    try {
      return await this.get('/database/stats');
    } catch (error) {
      console.error('Erro ao obter estatísticas de conexão:', error);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DE USUÁRIOS =====
  
  // Listar todos os usuários
  static async getAllUsers() {
    try {
      return await this.get('/users');
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
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
      return await this.put(`/users/${id}`, userData);
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      throw error;
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
      return await this.get('/clients');
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
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
      return await this.put(`/clients/${id}`, clientData);
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
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
      return await this.get('/equipments');
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      throw error;
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
      return await this.put(`/equipments/${id}`, equipmentData);
    } catch (error) {
      console.error(`Erro ao atualizar equipamento ${id}:`, error);
      throw error;
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
      const models = await this.get('/machine-models');
      console.log('Modelos recebidos:', models ? models.length : 0);
      console.log('Estrutura do primeiro modelo:', models && models.length > 0 ? JSON.stringify(models[0]) : 'nenhum modelo');
      return models;
    } catch (error) {
      console.error('Erro ao buscar modelos de máquinas:', error);
      
      // Se falhar, tentamos a rota de fallback com dados fixos
      try {
        console.log('Tentando rota alternativa com dados fixos...');
        const models = await this.get('/models-fixed');
        console.log('Modelos fixos recebidos:', models ? models.length : 0);
        console.log('Estrutura do primeiro modelo fixo:', models && models.length > 0 ? JSON.stringify(models[0]) : 'nenhum modelo');
        return models;
      } catch (fallbackError) {
        console.error('Erro na rota alternativa:', fallbackError);
        throw error; // Lançamos o erro original
      }
    }
  }
  
  // Listar todas as famílias de máquinas
  static async getAllMachineFamilies() {
    try {
      return await this.get('/machine-families');
    } catch (error) {
      console.error('Erro ao buscar famílias de máquinas:', error);
      throw error;
    }
  }
}

export default ApiService;
