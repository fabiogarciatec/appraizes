// server.js
// Servidor Express para fornecer uma API que se conecta ao banco de dados MySQL
// Este arquivo centraliza toda a lógica de API e conexão com o banco de dados

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

// Carrega as variáveis de ambiente
dotenv.config();

// Inicialização do servidor
const app = express();
const port = process.env.API_PORT || 3001;

// Configuração do middleware
app.use(cors());
app.use(express.json());

// Classe para gerenciar a conexão com o banco de dados
class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
    this.stats = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      totalQueryTime: 0,
      lastQueryTime: 0,
      averageQueryTime: 0,
      connectionErrors: 0,
      lastError: null,
      lastErrorTime: null
    };
  }

  // Inicializa o pool de conexões
  async initialize() {
    if (this.isInitialized) {
      console.log('Pool de conexões já inicializado');
      return;
    }

    try {
      // Configuração do pool de conexões
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Testa a conexão
      await this.query('SELECT 1');
      
      this.isInitialized = true;
      console.log('Pool de conexões inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar pool de conexões:', error);
      this.recordConnectionError(error);
      throw error;
    }
  }

  // Executa uma consulta SQL com timeout
  async query(sql, params = [], timeout = 30000) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    let success = false;

    try {
      // Cria uma promessa com timeout
      const queryPromise = this.pool.query(sql, params);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Query timeout after ${timeout}ms: ${sql}`));
        }, timeout);
      });

      // Executa a consulta com timeout
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // Garante que o resultado seja sempre um array
      // mysql2 retorna [rows, fields], queremos apenas as linhas
      const rows = Array.isArray(result) && result.length > 0 ? result[0] : [];
      
      // Adiciona logs para depuração
      console.log('Resultado da consulta SQL:', JSON.stringify(rows));
      console.log('Tipo do resultado:', typeof rows);
      console.log('O resultado é um array?', Array.isArray(rows));
      
      success = true;
      return [rows, result[1]];
    } catch (error) {
      console.error('Erro na consulta SQL:', error);
      this.recordConnectionError(error);
      throw error;
    } finally {
      // Atualiza as estatísticas
      const queryTime = Date.now() - startTime;
      this.updateStats(queryTime, success);
    }
  }

  // Atualiza as estatísticas de conexão
  updateStats(queryTime, success) {
    this.stats.totalQueries++;
    this.stats.totalQueryTime += queryTime;
    this.stats.lastQueryTime = queryTime;
    
    if (success) {
      this.stats.successfulQueries++;
    } else {
      this.stats.failedQueries++;
    }
    
    this.stats.averageQueryTime = this.stats.totalQueryTime / this.stats.totalQueries;
  }

  // Registra um erro de conexão
  recordConnectionError(error) {
    this.stats.connectionErrors++;
    this.stats.lastError = error.message;
    this.stats.lastErrorTime = new Date().toISOString();
  }

  // Retorna as estatísticas de conexão
  getStats() {
    return { ...this.stats };
  }

  // Encerra o pool de conexões
  async end() {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
      console.log('Pool de conexões encerrado');
    }
  }
}

// Instância do gerenciador de banco de dados
const dbManager = new DatabaseManager();

// Middleware para inicializar a conexão com o banco de dados
app.use(async (req, res, next) => {
  try {
    if (!dbManager.isInitialized) {
      await dbManager.initialize();
    }
    next();
  } catch (error) {
    console.error('Erro ao inicializar conexão com o banco de dados:', error);
    res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
  }
});

// Rota para verificar o status da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseConnection: dbManager.isInitialized ? 'connected' : 'disconnected'
  });
});

// Rota para obter estatísticas de conexão
app.get('/api/database/stats', (req, res) => {
  try {
    const stats = dbManager.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas de conexão' });
  }
});

// Rota para testar a conexão com o banco de dados
app.get('/api/database/test', async (req, res) => {
  try {
    // Tenta executar uma consulta simples para verificar a conexão
    const [result] = await dbManager.query('SELECT 1 as test');
    
    console.log('Resultado do teste de conexão:', result);
    
    // Retorna informações básicas
    res.json({
      success: true,
      message: `Conexão com o banco de dados '${process.env.DB_NAME}' estabelecida com sucesso`,
      database: process.env.DB_NAME,
      test_result: result,
      stats: dbManager.getStats()
    });
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao testar conexão com o banco de dados',
      error: error.message
    });
  }
});

// ===== ROTAS DE AUTENTICAÇÃO =====

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }
    
    // Consulta o usuário no banco de dados
    const [users] = await dbManager.query(
      'SELECT id, username, name, email, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    
    // Remove a senha do objeto de usuário
    const user = users[0];
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro durante login:', error);
    res.status(500).json({ error: 'Erro ao processar login' });
  }
});

// ===== ROTAS DE USUÁRIOS =====

// Listar todos os usuários
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await dbManager.query(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE active = TRUE'
    );
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Obter um usuário específico
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await dbManager.query(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Criar um novo usuário
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;
    
    if (!username || !password || !name || !email || !role) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // Verifica se o usuário já existe
    const [existingUsers] = await dbManager.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Nome de usuário já existe' });
    }
    
    // Insere o novo usuário
    const [result] = await dbManager.query(
      'INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, password, name, email, role]
    );
    
    const userId = result.insertId;
    
    // Busca o usuário recém-criado
    const [users] = await dbManager.query(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.status(201).json(users[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Atualizar um usuário existente
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    
    // Verifica se o usuário existe
    const [existingUsers] = await dbManager.query(
      'SELECT id FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Constrói a consulta SQL dinamicamente com base nos campos fornecidos
    let sql = 'UPDATE users SET updated_at = NOW()';
    const params = [];
    
    if (name) {
      sql += ', name = ?';
      params.push(name);
    }
    
    if (email) {
      sql += ', email = ?';
      params.push(email);
    }
    
    if (role) {
      sql += ', role = ?';
      params.push(role);
    }
    
    if (password) {
      sql += ', password = ?';
      params.push(password);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);
    
    // Executa a atualização
    await dbManager.query(sql, params);
    
    // Busca o usuário atualizado
    const [users] = await dbManager.query(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Excluir um usuário (exclusão lógica)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o usuário existe
    const [existingUsers] = await dbManager.query(
      'SELECT id FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Realiza a exclusão lógica
    await dbManager.query(
      'UPDATE users SET active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// ===== ROTAS DE CLIENTES =====

// Listar todos os clientes
app.get('/api/clients', async (req, res) => {
  try {
    const [clients] = await dbManager.query(
      'SELECT * FROM clients WHERE active = TRUE'
    );
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Obter um cliente específico
app.get('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [clients] = await dbManager.query(
      'SELECT * FROM clients WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (clients.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(clients[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Criar um novo cliente
app.post('/api/clients', async (req, res) => {
  try {
    const { 
      name, 
      cpf_cnpj, 
      rg_insc_est, 
      insc_munic, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      postal_code, 
      contact_name 
    } = req.body;
    
    if (!name || !cpf_cnpj) {
      return res.status(400).json({ error: 'Nome e CPF/CNPJ são obrigatórios' });
    }
    
    // Verifica se o cliente já existe
    const [existingClients] = await dbManager.query(
      'SELECT id FROM clients WHERE cpf_cnpj = ?',
      [cpf_cnpj]
    );
    
    if (existingClients.length > 0) {
      return res.status(409).json({ error: 'Cliente com este CPF/CNPJ já existe' });
    }
    
    // Insere o novo cliente
    const [result] = await dbManager.query(
      `INSERT INTO clients (
        name, cpf_cnpj, rg_insc_est, insc_munic, email, phone, 
        address, city, state, postal_code, contact_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, cpf_cnpj, rg_insc_est, insc_munic, email, phone, 
        address, city, state, postal_code, contact_name
      ]
    );
    
    const clientId = result.insertId;
    
    // Busca o cliente recém-criado
    const [clients] = await dbManager.query(
      'SELECT * FROM clients WHERE id = ?',
      [clientId]
    );
    
    res.status(201).json(clients[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar um cliente existente
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      postal_code, 
      contact_name,
      rg_insc_est,
      insc_munic
    } = req.body;
    
    // Verifica se o cliente existe
    const [existingClients] = await dbManager.query(
      'SELECT id FROM clients WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (existingClients.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Constrói a consulta SQL dinamicamente com base nos campos fornecidos
    let sql = 'UPDATE clients SET updated_at = NOW()';
    const params = [];
    
    if (name) {
      sql += ', name = ?';
      params.push(name);
    }
    
    if (email) {
      sql += ', email = ?';
      params.push(email);
    }
    
    if (phone) {
      sql += ', phone = ?';
      params.push(phone);
    }
    
    if (address) {
      sql += ', address = ?';
      params.push(address);
    }
    
    if (city) {
      sql += ', city = ?';
      params.push(city);
    }
    
    if (state) {
      sql += ', state = ?';
      params.push(state);
    }
    
    if (postal_code) {
      sql += ', postal_code = ?';
      params.push(postal_code);
    }
    
    if (contact_name) {
      sql += ', contact_name = ?';
      params.push(contact_name);
    }
    
    if (rg_insc_est) {
      sql += ', rg_insc_est = ?';
      params.push(rg_insc_est);
    }
    
    if (insc_munic) {
      sql += ', insc_munic = ?';
      params.push(insc_munic);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);
    
    // Executa a atualização
    await dbManager.query(sql, params);
    
    // Busca o cliente atualizado
    const [clients] = await dbManager.query(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );
    
    res.json(clients[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Excluir um cliente (exclusão lógica)
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o cliente existe
    const [existingClients] = await dbManager.query(
      'SELECT id FROM clients WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (existingClients.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Realiza a exclusão lógica
    await dbManager.query(
      'UPDATE clients SET active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

// ===== ROTAS DE MARCAS DE MÁQUINAS =====

// Listar marcas de máquinas
app.get('/api/machine-brands', async (req, res) => {
  try {
    const [brands] = await dbManager.query('SELECT id, name, created_at FROM marcas WHERE active = 1 ORDER BY id ASC');
    res.json(brands);
  } catch (error) {
    console.error('Erro ao buscar marcas de máquinas:', error);
    res.status(500).json({ error: 'Erro ao buscar marcas de máquinas: ' + error.message });
  }
});

// Criar nova marca de máquina
app.post('/api/machine-brands', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'O campo name é obrigatório.' });
    }
    const [result] = await dbManager.query('INSERT INTO marcas (name, active, created_at, updated_at) VALUES (?, TRUE, NOW(), NOW())', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error('Erro ao criar marca:', error);
    res.status(500).json({ error: 'Erro ao criar marca: ' + error.message });
  }
});

// Atualizar marca de máquina
app.put('/api/machine-brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'O campo name é obrigatório.' });
    }
    const [result] = await dbManager.query('UPDATE marcas SET name = ?, updated_at = NOW() WHERE id = ? AND active = TRUE', [name, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Marca não encontrada.' });
    }
    res.json({ id, name });
  } catch (error) {
    console.error('Erro ao atualizar marca:', error);
    res.status(500).json({ error: 'Erro ao atualizar marca: ' + error.message });
  }
});

// Excluir marca de máquina (exclusão lógica)
app.delete('/api/machine-brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await dbManager.query('UPDATE marcas SET active = FALSE, updated_at = NOW() WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Marca não encontrada.' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir marca:', error);
    res.status(500).json({ error: 'Erro ao excluir marca: ' + error.message });
  }
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Servidor API rodando na porta ${port}`);
  console.log(`Acesse: http://localhost:${port}/api/status`);
});

// Tratamento para encerrar o servidor graciosamente
process.on('SIGINT', async () => {
  console.log('Encerrando servidor API...');
  
  try {
    if (dbManager.isInitialized) {
      await dbManager.end();
      console.log('Conexão com o banco de dados encerrada');
    }
  } catch (error) {
    console.error('Erro ao encerrar conexão com o banco de dados:', error);
  }
  
  process.exit(0);
});

module.exports = app;
