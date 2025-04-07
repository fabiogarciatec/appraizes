// api.js
// Servidor Express para fornecer uma API que se conecta ao banco de dados MySQL
// Este arquivo centraliza toda a lógica de API e conexão com o banco de dados

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

// Inicialização do servidor
const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
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
      
      success = true;
      return result;
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
    // Configurando um pool de conexão temporário para o teste
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });
    
    // Testa a conexão com uma consulta simples
    const [testResult] = await pool.query('SELECT 1 as test');
    
    // Verifica os bancos de dados disponíveis
    const [databases] = await pool.query('SHOW DATABASES');
    const databaseList = databases.map(db => db.Database);
    
    // Verifica as tabelas existentes
    const [tables] = await pool.query('SHOW TABLES');
    const tableColumn = `Tables_in_${process.env.DB_NAME}`;
    const tableList = [];
    
    // Processa as tabelas com segurança
    for (const table of tables) {
      if (table && table[tableColumn]) {
        tableList.push(table[tableColumn]);
      }
    }
    
    // Encerra o pool de conexões
    await pool.end();
    
    // Retorna informações detalhadas
    res.json({
      success: true,
      message: `Conexão com o banco de dados '${process.env.DB_NAME}' estabelecida com sucesso`,
      database: process.env.DB_NAME,
      tables: tableList,
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

// Rota para obter estatísticas de conexão com o banco de dados
app.get('/api/database/stats', async (req, res) => {
  try {
    // Retorna as estatísticas de conexão
    const stats = dbManager.getStats();
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter estatísticas de conexão',
      error: error.message
    });
  }
});

// ===== ROTAS DE AUTENTICAÇÃO =====

// Rota para autenticação de usuários (login)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }
    
    // Busca o usuário pelo nome de usuário
    const [users] = await dbManager.query(
      'SELECT * FROM users WHERE username = ? AND active = TRUE',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    
    const user = users[0];
    
    // Verifica a senha (em uma aplicação real, usaria bcrypt ou similar)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    
    // Remove a senha do objeto de usuário antes de retornar
    delete user.password;
    
    res.json({
      success: true,
      message: 'Autenticação realizada com sucesso',
      user
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro ao autenticar usuário' });
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
    
    // Validação básica
    if (!username || !password || !name || !email || !role) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // Verifica se o usuário já existe
    const [existingUsers] = await dbManager.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Usuário ou email já cadastrado' });
    }
    
    // Insere o novo usuário
    const [result] = await dbManager.query(
      'INSERT INTO users (username, password, name, email, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())',
      [username, password, name, email, role]
    );
    
    // Busca o usuário recém-criado (sem a senha)
    const [newUsers] = await dbManager.query(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: newUsers[0]
    });
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
    
    // Validação básica
    if (!name && !email && !role && !password) {
      return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
    }
    
    // Verifica se o usuário existe
    const [users] = await dbManager.query(
      'SELECT id FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Constrói a query de atualização dinamicamente
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const params = [];
    
    if (name) {
      updateQuery += ', name = ?';
      params.push(name);
    }
    
    if (email) {
      updateQuery += ', email = ?';
      params.push(email);
    }
    
    if (role) {
      updateQuery += ', role = ?';
      params.push(role);
    }
    
    if (password) {
      updateQuery += ', password = ?';
      params.push(password);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    // Executa a atualização
    await dbManager.query(updateQuery, params);
    
    // Busca o usuário atualizado (sem a senha)
    const [updatedUsers] = await dbManager.query(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: updatedUsers[0]
    });
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
    const [users] = await dbManager.query(
      'SELECT id FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (users.length === 0) {
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
      zip_code, 
      contact_name 
    } = req.body;
    
    // Validação básica
    if (!name || !cpf_cnpj) {
      return res.status(400).json({ error: 'Nome e CPF/CNPJ são obrigatórios' });
    }
    
    // Verifica se o cliente já existe
    const [existingClients] = await dbManager.query(
      'SELECT id FROM clients WHERE cpf_cnpj = ?',
      [cpf_cnpj]
    );
    
    if (existingClients.length > 0) {
      return res.status(409).json({ error: 'Cliente já cadastrado com este CPF/CNPJ' });
    }
    
    // Insere o novo cliente
    const [result] = await dbManager.query(
      `INSERT INTO clients (
        name, 
        cpf_cnpj, 
        rg_insc_est, 
        insc_munic, 
        email, 
        phone, 
        address, 
        city, 
        state, 
        zip_code, 
        contact_name, 
        active, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [
        name, 
        cpf_cnpj, 
        rg_insc_est, 
        insc_munic, 
        email, 
        phone, 
        address, 
        city, 
        state, 
        zip_code, 
        contact_name
      ]
    );
    
    // Busca o cliente recém-criado
    const [newClients] = await dbManager.query(
      'SELECT * FROM clients WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      client: newClients[0]
    });
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
      rg_insc_est, 
      insc_munic, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      zip_code, 
      contact_name 
    } = req.body;
    
    // Validação básica
    if (!name && !email && !phone && !address) {
      return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
    }
    
    // Verifica se o cliente existe
    const [clients] = await dbManager.query(
      'SELECT id FROM clients WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (clients.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Constrói a query de atualização dinamicamente
    let updateQuery = 'UPDATE clients SET updated_at = NOW()';
    const params = [];
    
    if (name) {
      updateQuery += ', name = ?';
      params.push(name);
    }
    
    if (rg_insc_est) {
      updateQuery += ', rg_insc_est = ?';
      params.push(rg_insc_est);
    }
    
    if (insc_munic) {
      updateQuery += ', insc_munic = ?';
      params.push(insc_munic);
    }
    
    if (email) {
      updateQuery += ', email = ?';
      params.push(email);
    }
    
    if (phone) {
      updateQuery += ', phone = ?';
      params.push(phone);
    }
    
    if (address) {
      updateQuery += ', address = ?';
      params.push(address);
    }
    
    if (city) {
      updateQuery += ', city = ?';
      params.push(city);
    }
    
    if (state) {
      updateQuery += ', state = ?';
      params.push(state);
    }
    
    if (zip_code) {
      updateQuery += ', zip_code = ?';
      params.push(zip_code);
    }
    
    if (contact_name) {
      updateQuery += ', contact_name = ?';
      params.push(contact_name);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    // Executa a atualização
    await dbManager.query(updateQuery, params);
    
    // Busca o cliente atualizado
    const [updatedClients] = await dbManager.query(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      client: updatedClients[0]
    });
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
    const [clients] = await dbManager.query(
      'SELECT id FROM clients WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (clients.length === 0) {
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

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor API rodando na porta ${port}`);
  console.log(`Acesse: http://localhost:${port}/api/status`);
});

// Tratamento de encerramento do processo
process.on('SIGINT', async () => {
  console.log('Encerrando servidor...');
  await dbManager.end();
  process.exit(0);
});

module.exports = app;
