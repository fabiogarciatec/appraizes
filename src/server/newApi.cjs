// newApi.cjs
// Servidor Express completamente novo para fornecer uma API que se conecta ao banco de dados MySQL

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { clearLog, logToFile, requestLogger } = require('./api-log.cjs');

// Carrega as variáveis de ambiente
dotenv.config();

// Limpa o arquivo de log ao iniciar o servidor
clearLog();

// Inicialização do servidor
const app = express();
const port = process.env.API_PORT || 3001;

// Configuração do CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Middleware para logging de requisições
app.use(requestLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estatísticas de conexão
const connectionStats = {
  totalQueries: 0,
  successfulQueries: 0,
  failedQueries: 0,
  lastQueryTime: 0,
  averageQueryTime: 0,
  totalQueryTime: 0,
  lastError: null,
  lastQuery: null
};

// Função para criar um pool de conexão
const createPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // 60 segundos
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000 // 10 segundos
  });
};

// Função para executar uma consulta SQL com retry
const executeQuery = async (sql, params = [], maxRetries = 3) => {
  const startTime = Date.now();
  let retries = 0;
  let lastError = null;
  
  while (retries <= maxRetries) {
    const pool = createPool();
    
    try {
      connectionStats.totalQueries++;
      connectionStats.lastQuery = sql;
      
      const [result] = await pool.query(sql, params);
      
      const queryTime = Date.now() - startTime;
      connectionStats.lastQueryTime = queryTime;
      connectionStats.totalQueryTime += queryTime;
      connectionStats.successfulQueries++;
      connectionStats.averageQueryTime = connectionStats.totalQueryTime / connectionStats.successfulQueries;
      
      await pool.end();
      return result;
    } catch (error) {
      lastError = error;
      connectionStats.failedQueries++;
      connectionStats.lastError = error.message;
      
      console.error(`Erro na consulta (tentativa ${retries + 1}/${maxRetries + 1}):`, error.message);
      
      // Fecha a conexão
      try {
        await pool.end();
      } catch (endError) {
        console.error('Erro ao fechar pool de conexão:', endError.message);
      }
      
      // Verifica se é um erro de conexão para tentar novamente
      const connectionErrors = ['ETIMEDOUT', 'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR'];
      if (connectionErrors.includes(error.code) && retries < maxRetries) {
        retries++;
        const delay = 1000 * retries; // Backoff exponencial
        console.log(`Tentando reconectar em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
};

// Rota para verificar o status da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota para testar a conexão com o banco de dados
app.get('/api/database/test', async (req, res) => {
  try {
    // Executa uma consulta simples para testar a conexão
    const testResult = await executeQuery('SELECT 1 as test');
    
    // Verifica os bancos de dados disponíveis
    const databases = await executeQuery('SHOW DATABASES');
    const databaseList = databases.map(db => db.Database);
    
    // Verifica as tabelas existentes
    const tables = await executeQuery('SHOW TABLES');
    const tableColumn = `Tables_in_${process.env.DB_NAME}`;
    const tableList = [];
    
    // Processa as tabelas com segurança
    for (const table of tables) {
      if (table && table[tableColumn]) {
        tableList.push(table[tableColumn]);
      }
    }
    
    // Retorna informações detalhadas
    res.json({
      success: true,
      connected: true, // Campo esperado pelo DatabaseContext
      message: 'Conexão com o banco de dados estabelecida com sucesso',
      timestamp: new Date().toISOString(),
      database: process.env.DB_NAME,
      databases: databaseList,
      tables: tableList,
      stats: connectionStats
    });
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    res.status(500).json({ 
      success: false, 
      connected: false, // Campo esperado pelo DatabaseContext
      message: 'Erro ao testar conexão com o banco de dados',
      error: error.message
    });
  }
});

// Rota para obter estatísticas de conexão com o banco de dados
app.get('/api/database/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: connectionStats
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

// Rota para autenticação de usuários (login)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome de usuário e senha são obrigatórios' 
      });
    }
    
    // Busca o usuário no banco de dados
    const users = await executeQuery(
      'SELECT * FROM users WHERE username = ? AND active = TRUE LIMIT 1',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado ou inativo' 
      });
    }
    
    const user = users[0];
    
    // Verifica a senha (implementação simples, sem hash por enquanto)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Senha incorreta' 
      });
    }
    
    // Remove a senha do objeto de usuário antes de enviar na resposta
    delete user.password;
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: user
    });
  } catch (error) {
    console.error('Erro durante login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro durante o processo de login',
      error: error.message
    });
  }
});

// Rota para listar todos os usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE active = TRUE'
    );
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar usuários',
      error: error.message
    });
  }
});

// Rota para criar um novo usuário
app.post('/api/users', async (req, res) => {
  try {
    const { username, name, email, role, password } = req.body;
    
    // Validação básica
    if (!username || !name || !email || !role || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios' 
      });
    }
    
    // Verifica se o username já existe
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE username = ? AND active = TRUE',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome de usuário já existe' 
      });
    }
    
    // Insere o novo usuário
    const result = await executeQuery(
      'INSERT INTO users (username, name, email, role, password, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())',
      [username, name, email, role, password]
    );
    
    // Busca o usuário recém-criado
    const newUser = await executeQuery(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
});

// Rota para obter um usuário específico
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const users = await executeQuery(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error(`Erro ao buscar usuário ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
});

// Rota para atualizar a senha de um usuário
app.put('/api/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'A senha é obrigatória' 
      });
    }
    
    // Verifica se o usuário existe
    const users = await executeQuery(
      'SELECT id FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    // Atualiza a senha do usuário
    await executeQuery(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [password, id]
    );
    
    res.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    console.error(`Erro ao atualizar senha do usuário ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar senha do usuário',
      error: error.message
    });
  }
});

// Rota para atualizar um usuário
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, email, role, password } = req.body;
    
    if (!username || !name || !email || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios, exceto a senha' 
      });
    }
    
    // Verifica se o usuário existe
    const users = await executeQuery(
      'SELECT id FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    // Verifica se o username já existe (exceto o próprio usuário)
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE username = ? AND id != ? AND active = TRUE',
      [username, id]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome de usuário já existe' 
      });
    }
    
    // Prepara a query de atualização
    let query = 'UPDATE users SET username = ?, name = ?, email = ?, role = ?, updated_at = NOW()';
    let params = [username, name, email, role];
    
    // Adiciona a senha na query se ela foi fornecida
    if (password) {
      query += ', password = ?';
      params.push(password);
    }
    
    // Adiciona a condição WHERE
    query += ' WHERE id = ?';
    params.push(id);
    
    // Executa a query de atualização
    await executeQuery(query, params);
    
    // Busca o usuário atualizado
    const updatedUser = await executeQuery(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
});

// Rota para excluir um usuário (exclusão lógica)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o usuário existe
    const users = await executeQuery(
      'SELECT id, role FROM users WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    // Impede a exclusão do usuário administrador principal (id 1)
    if (id === '1' && users[0].role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Não é possível excluir o usuário administrador principal' 
      });
    }
    
    // Realiza a exclusão lógica (desativa o usuário)
    await executeQuery(
      'UPDATE users SET active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error(`Erro ao excluir usuário ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir usuário',
      error: error.message
    });
  }
});

// Rota para listar todos os clientes
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await executeQuery(
      'SELECT * FROM clients WHERE active = TRUE'
    );
    
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar clientes',
      error: error.message
    });
  }
});

// Rota para obter um cliente específico
app.get('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const clients = await executeQuery(
      'SELECT * FROM clients WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (clients.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }
    
    res.json(clients[0]);
  } catch (error) {
    console.error(`Erro ao buscar cliente ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar cliente',
      error: error.message
    });
  }
});

// Rota para criar um novo cliente
app.post('/api/clients', async (req, res) => {
  try {
    console.log('Recebida requisição POST para /api/clients:', req.body);
    
    const { name, contact, phone, email, cpf_cnpj, rg_insc_est, insc_munic } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'O nome da empresa é obrigatório' 
      });
    }
    
    // Verifica se a tabela clients existe
    try {
      const tables = await executeQuery('SHOW TABLES');
      const tableColumn = `Tables_in_${process.env.DB_NAME}`;
      const tableExists = tables.some(table => table[tableColumn] === 'clients');
      
      if (!tableExists) {
        console.log('Tabela clients não existe. Criando...');
        await createClientsTableIfNotExists();
      }
    } catch (tableError) {
      console.error('Erro ao verificar tabela clients:', tableError);
    }
    
    // Insere o novo cliente no banco de dados
    try {
      // Verifica a estrutura da tabela para determinar quais campos usar
      const structure = await executeQuery('DESCRIBE clients');
      const columns = structure.map(field => field.Field);
      
      let query = 'INSERT INTO clients (';
      let placeholders = '';
      let values = [];
      
      // Adiciona os campos básicos
      query += 'name, active, created_at, updated_at';
      placeholders += '?, TRUE, NOW(), NOW()';
      values.push(name);
      
      // Adiciona os campos opcionais se existirem na tabela
      if (columns.includes('contact') && contact) {
        query += ', contact';
        placeholders += ', ?';
        values.push(contact);
      }
      
      if (columns.includes('phone') && phone) {
        query += ', phone';
        placeholders += ', ?';
        values.push(phone);
      }
      
      if (columns.includes('email') && email) {
        query += ', email';
        placeholders += ', ?';
        values.push(email);
      }
      
      if (columns.includes('cpf_cnpj') && cpf_cnpj) {
        query += ', cpf_cnpj';
        placeholders += ', ?';
        values.push(cpf_cnpj);
      }
      
      if (columns.includes('rg_insc_est') && rg_insc_est) {
        query += ', rg_insc_est';
        placeholders += ', ?';
        values.push(rg_insc_est);
      }
      
      if (columns.includes('insc_munic') && insc_munic) {
        query += ', insc_munic';
        placeholders += ', ?';
        values.push(insc_munic);
      }
      
      query += `) VALUES (${placeholders})`;
      
      console.log('Executando query:', query);
      console.log('Com os valores:', values);
      
      const result = await executeQuery(query, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Falha ao criar cliente');
      }
      
      // Retorna o cliente criado
      const newClient = await executeQuery(
        'SELECT * FROM clients WHERE id = ?',
        [result.insertId]
      );
      
      console.log('Cliente criado com sucesso:', newClient[0]);
      
      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        client: newClient[0]
      });
    } catch (insertError) {
      console.error('Erro ao inserir cliente:', insertError);
      throw new Error(`Erro ao inserir cliente: ${insertError.message}`);
    }
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar cliente',
      error: error.message
    });
  }
});

// Rota para atualizar um cliente existente
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, phone, email } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'O nome da empresa é obrigatório' 
      });
    }
    
    // Verifica se o cliente existe
    const clients = await executeQuery(
      'SELECT id FROM clients WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (clients.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }
    
    // Atualiza o cliente no banco de dados
    const result = await executeQuery(
      'UPDATE clients SET name = ?, contact = ?, phone = ?, email = ?, updated_at = NOW() WHERE id = ?',
      [name, contact, phone, email, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Falha ao atualizar cliente');
    }
    
    // Retorna o cliente atualizado
    const updatedClient = await executeQuery(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      client: updatedClient[0]
    });
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar cliente',
      error: error.message
    });
  }
});

// Rota para excluir um cliente (exclusão lógica)
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o cliente existe
    const clients = await executeQuery(
      'SELECT id FROM clients WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (clients.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }
    
    // Realiza a exclusão lógica do cliente
    await executeQuery(
      'UPDATE clients SET active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    console.error(`Erro ao excluir cliente ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir cliente',
      error: error.message
    });
  }
});

// Função para criar a tabela de clientes se ela não existir
async function createClientsTableIfNotExists() {
  try {
    // Verifica se a tabela já existe
    const tables = await executeQuery('SHOW TABLES');
    const tableColumn = `Tables_in_${process.env.DB_NAME}`;
    const tableExists = tables.some(table => table[tableColumn] === 'clients');
    
    if (!tableExists) {
      console.log('Criando tabela de clientes...');
      
      // Cria a tabela de clientes com os campos unificados conforme solicitado
      await executeQuery(`
        CREATE TABLE clients (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          contact VARCHAR(255),
          phone VARCHAR(50),
          email VARCHAR(255),
          cpf_cnpj VARCHAR(20),
          rg_insc_est VARCHAR(20),
          insc_munic VARCHAR(20),
          active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Tabela de clientes criada com sucesso!');
    } else {
      console.log('Tabela de clientes já existe.');
    }
  } catch (error) {
    console.error('Erro ao criar tabela de clientes:', error);
  }
}

// Rota para obter estatísticas do banco de dados
app.get('/api/database/stats', async (req, res) => {
  try {
    // Obter contagens das tabelas principais
    const userCountResult = await executeQuery('SELECT COUNT(*) as count FROM users WHERE active = TRUE');
    const clientCountResult = await executeQuery('SELECT COUNT(*) as count FROM clients WHERE active = TRUE');
    const equipmentCountResult = await executeQuery('SELECT COUNT(*) as count FROM equipments');
    const familyCountResult = await executeQuery('SELECT COUNT(*) as count FROM machine_families');
    const modelCountResult = await executeQuery('SELECT COUNT(*) as count FROM machine_models');
    
    const userCount = userCountResult[0]?.count || 0;
    const clientCount = clientCountResult[0]?.count || 0;
    const equipmentCount = equipmentCountResult[0]?.count || 0;
    const familyCount = familyCountResult[0]?.count || 0;
    const modelCount = modelCountResult[0]?.count || 0;
    
    res.json({
      // Estatísticas de consultas
      totalQueries: connectionStats.totalQueries,
      successfulQueries: connectionStats.successfulQueries,
      failedQueries: connectionStats.failedQueries,
      
      // Tempos de resposta
      lastQueryTime: connectionStats.lastQueryTime,
      averageQueryTime: connectionStats.averageQueryTime,
      
      // Último erro (se houver)
      lastError: connectionStats.lastError,
      
      // Contagens de registros
      totalUsers: userCount,
      totalClients: clientCount,
      totalEquipments: equipmentCount,
      totalMachineFamilies: familyCount,
      totalMachineModels: modelCount
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas do banco de dados:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao obter estatísticas: ${error.message}`,
      // Retorna as estatísticas de consultas mesmo em caso de erro
      totalQueries: connectionStats.totalQueries,
      successfulQueries: connectionStats.successfulQueries,
      failedQueries: connectionStats.failedQueries,
      lastQueryTime: connectionStats.lastQueryTime,
      averageQueryTime: connectionStats.averageQueryTime,
      lastError: error.message
    });
  }
});

// Rota para inicializar a tabela de clientes
app.get('/api/database/init/clients', async (req, res) => {
  try {
    await createClientsTableIfNotExists();
    res.json({
      success: true,
      message: 'Tabela de clientes inicializada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao inicializar tabela de clientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao inicializar tabela de clientes',
      error: error.message
    });
  }
});

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Rota para verificar as tabelas existentes
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await executeQuery('SHOW TABLES');
    const tableColumn = `Tables_in_${process.env.DB_NAME}`;
    const tableList = [];
    
    for (const table of tables) {
      if (table && table[tableColumn]) {
        tableList.push(table[tableColumn]);
      }
    }
    
    res.json({
      success: true,
      message: 'Tabelas existentes no banco de dados',
      tables: tableList
    });
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao listar tabelas',
      error: error.message
    });
  }
});

// Rota para verificar a estrutura da tabela de clientes
app.get('/api/clients/structure', async (req, res) => {
  try {
    // Verifica se a tabela existe
    const tables = await executeQuery('SHOW TABLES');
    const tableColumn = `Tables_in_${process.env.DB_NAME}`;
    const tableExists = tables.some(table => table[tableColumn] === 'clients');
    
    if (!tableExists) {
      return res.status(404).json({
        success: false,
        message: 'A tabela de clientes não existe'
      });
    }
    
    // Obtém a estrutura da tabela
    const structure = await executeQuery('DESCRIBE clients');
    res.json({
      success: true,
      message: 'Estrutura da tabela de clientes',
      structure
    });
  } catch (error) {
    console.error('Erro ao verificar estrutura da tabela de clientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar estrutura da tabela de clientes',
      error: error.message
    });
  }
});

// Rota para verificar o conteúdo da tabela de clientes
app.get('/api/clients/content', async (req, res) => {
  try {
    // Verifica se a tabela existe
    const tables = await executeQuery('SHOW TABLES');
    const tableColumn = `Tables_in_${process.env.DB_NAME}`;
    const tableExists = tables.some(table => table[tableColumn] === 'clients');
    
    if (!tableExists) {
      return res.status(404).json({
        success: false,
        message: 'A tabela de clientes não existe'
      });
    }
    
    // Obtém o conteúdo da tabela
    const content = await executeQuery('SELECT * FROM clients LIMIT 10');
    res.json({
      success: true,
      message: 'Conteúdo da tabela de clientes',
      count: content.length,
      content
    });
  } catch (error) {
    console.error('Erro ao verificar conteúdo da tabela de clientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar conteúdo da tabela de clientes',
      error: error.message
    });
  }
});

// Rota para listar todos os equipamentos
app.get('/api/equipments', async (req, res) => {
  try {
    const equipments = await executeQuery(
      'SELECT e.*, mm.name as model_name, mf.name as family_name, c.name as client_name ' +
      'FROM equipments e ' +
      'LEFT JOIN machine_models mm ON e.model_id = mm.id ' +
      'LEFT JOIN machine_families mf ON e.family_id = mf.id ' +
      'LEFT JOIN clients c ON e.client_id = c.id ' +
      'WHERE e.active = TRUE'
    );
    
    res.json(equipments);
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar equipamentos',
      error: error.message
    });
  }
});

// Rota para obter um equipamento específico
app.get('/api/equipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const equipments = await executeQuery(
      'SELECT e.*, mm.name as model_name, mf.name as family_name, c.name as client_name ' +
      'FROM equipments e ' +
      'LEFT JOIN machine_models mm ON e.model_id = mm.id ' +
      'LEFT JOIN machine_families mf ON e.family_id = mf.id ' +
      'LEFT JOIN clients c ON e.client_id = c.id ' +
      'WHERE e.id = ? AND e.active = TRUE',
      [id]
    );
    
    if (equipments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Equipamento não encontrado' 
      });
    }
    
    res.json(equipments[0]);
  } catch (error) {
    console.error(`Erro ao buscar equipamento ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar equipamento',
      error: error.message
    });
  }
});

// Rota para criar um novo equipamento
app.post('/api/equipments', async (req, res) => {
  try {
    console.log('Recebida requisição POST para /api/equipments:', req.body);
    
    const { chassis, series, modelId, familyId, year, hourmeter, clientId } = req.body;
    
    if (!chassis || !modelId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chassis e modelo são obrigatórios' 
      });
    }
    
    // Insere o novo equipamento no banco de dados
    const result = await executeQuery(
      'INSERT INTO equipments (chassis, series, model_id, family_id, year, hourmeter, client_id, active, created_at, updated_at) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())',
      [chassis, series, modelId, familyId, year, hourmeter, clientId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Falha ao criar equipamento');
    }
    
    // Retorna o equipamento criado
    const newEquipment = await executeQuery(
      'SELECT e.*, mm.name as model_name, mf.name as family_name, c.name as client_name ' +
      'FROM equipments e ' +
      'LEFT JOIN machine_models mm ON e.model_id = mm.id ' +
      'LEFT JOIN machine_families mf ON e.family_id = mf.id ' +
      'LEFT JOIN clients c ON e.client_id = c.id ' +
      'WHERE e.id = ?',
      [result.insertId]
    );
    
    console.log('Equipamento criado com sucesso:', newEquipment[0]);
    
    res.status(201).json({
      success: true,
      message: 'Equipamento criado com sucesso',
      equipment: newEquipment[0]
    });
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar equipamento',
      error: error.message
    });
  }
});

// Rota para atualizar um equipamento existente
app.put('/api/equipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { chassis, series, modelId, familyId, year, hourmeter, clientId } = req.body;
    
    if (!chassis || !modelId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chassis e modelo são obrigatórios' 
      });
    }
    
    // Verifica se o equipamento existe
    const equipments = await executeQuery(
      'SELECT id FROM equipments WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (equipments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Equipamento não encontrado' 
      });
    }
    
    // Atualiza o equipamento no banco de dados
    const result = await executeQuery(
      'UPDATE equipments SET chassis = ?, series = ?, model_id = ?, family_id = ?, year = ?, hourmeter = ?, client_id = ?, updated_at = NOW() WHERE id = ?',
      [chassis, series, modelId, familyId, year, hourmeter, clientId, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Falha ao atualizar equipamento');
    }
    
    // Retorna o equipamento atualizado
    const updatedEquipment = await executeQuery(
      'SELECT e.*, mm.name as model_name, mf.name as family_name, c.name as client_name ' +
      'FROM equipments e ' +
      'LEFT JOIN machine_models mm ON e.model_id = mm.id ' +
      'LEFT JOIN machine_families mf ON e.family_id = mf.id ' +
      'LEFT JOIN clients c ON e.client_id = c.id ' +
      'WHERE e.id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Equipamento atualizado com sucesso',
      equipment: updatedEquipment[0]
    });
  } catch (error) {
    console.error(`Erro ao atualizar equipamento ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar equipamento',
      error: error.message
    });
  }
});

// Rota para excluir um equipamento (exclusão lógica)
app.delete('/api/equipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o equipamento existe
    const equipments = await executeQuery(
      'SELECT id FROM equipments WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (equipments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Equipamento não encontrado' 
      });
    }
    
    // Realiza a exclusão lógica do equipamento
    await executeQuery(
      'UPDATE equipments SET active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Equipamento excluído com sucesso'
    });
  } catch (error) {
    console.error(`Erro ao excluir equipamento ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir equipamento',
      error: error.message
    });
  }
});

// Rota para listar todos os modelos de máquinas
app.get('/api/machine-models', async (req, res) => {
  try {
    const models = await executeQuery(
      'SELECT * FROM machine_models WHERE active = TRUE'
    );
    
    res.json(models);
  } catch (error) {
    console.error('Erro ao buscar modelos de máquinas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar modelos de máquinas',
      error: error.message
    });
  }
});

// Rota para listar todas as famílias de máquinas
app.get('/api/machine-families', async (req, res) => {
  try {
    const families = await executeQuery(
      'SELECT * FROM machine_families WHERE active = TRUE'
    );
    
    res.json(families);
  } catch (error) {
    console.error('Erro ao buscar famílias de máquinas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar famílias de máquinas',
      error: error.message
    });
  }
});

// Função para criar a tabela de famílias de máquinas
async function createMachineFamiliesTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS machine_families (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Verifica se já existem dados na tabela
    const families = await executeQuery('SELECT * FROM machine_families');
    
    // Se não houver dados, insere alguns registros iniciais
    if (families.length === 0) {
      await executeQuery(`
        INSERT INTO machine_families (name, description) VALUES
        ('Escavadeiras', 'Máquinas para escavação e movimentação de terra'),
        ('Carregadeiras', 'Máquinas para carregamento de materiais'),
        ('Tratores', 'Máquinas para trabalhos diversos em terrenos'),
        ('Rolos Compactadores', 'Máquinas para compactação de solo e asfalto'),
        ('Motoniveladoras', 'Máquinas para nivelamento de terrenos')
      `);
    }
    
    console.log('Tabela de famílias de máquinas verificada/criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela de famílias de máquinas:', error);
  }
}

// Função para criar a tabela de modelos de máquinas
async function createMachineModelsTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS machine_models (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        family_id INT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES machine_families(id)
      )
    `);
    
    // Verifica se já existem dados na tabela
    const models = await executeQuery('SELECT * FROM machine_models');
    
    // Se não houver dados, insere alguns registros iniciais
    if (models.length === 0) {
      await executeQuery(`
        INSERT INTO machine_models (name, family_id, description) VALUES
        ('CAT 320', 1, 'Escavadeira hidráulica de médio porte'),
        ('CAT 336', 1, 'Escavadeira hidráulica de grande porte'),
        ('CAT 950', 2, 'Carregadeira de rodas de médio porte'),
        ('CAT 980', 2, 'Carregadeira de rodas de grande porte'),
        ('CAT D6', 3, 'Trator de esteiras médio'),
        ('CAT D8', 3, 'Trator de esteiras grande'),
        ('CAT CS54', 4, 'Rolo compactador de solo'),
        ('CAT 140', 5, 'Motoniveladora de médio porte')
      `);
    }
    
    console.log('Tabela de modelos de máquinas verificada/criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela de modelos de máquinas:', error);
  }
}

// Função para verificar a tabela de equipamentos
async function createEquipmentsTable() {
  try {
    // Apenas verifica se a tabela existe
    const tables = await executeQuery(
      "SHOW TABLES LIKE 'equipments'"
    );
    
    if (tables.length > 0) {
      console.log('Tabela de equipamentos já existe');
    } else {
      console.log('Tabela de equipamentos não encontrada');
    }
  } catch (error) {
    console.error('Erro ao verificar tabela de equipamentos:', error);
  }
}

// Inicializa as tabelas do banco de dados
async function initializeTables() {
  try {
    await createMachineFamiliesTable();
    await createMachineModelsTable();
    await createEquipmentsTable();
  } catch (error) {
    console.error('Erro ao inicializar tabelas:', error);
  }
}

// Rota para obter todas as famílias de máquinas
app.get('/api/machine-families', async (req, res) => {
  console.log('Recebida requisição para /api/machine-families');
  try {
    const families = await executeQuery(
      'SELECT * FROM machine_families WHERE active = TRUE ORDER BY name'
    );
    console.log('Famílias de máquinas encontradas:', families.length);
    res.json(families);
  } catch (error) {
    console.error('Erro ao buscar famílias de máquinas:', error);
    res.status(500).json({ error: 'Erro ao buscar famílias de máquinas: ' + error.message });
  }
});

// Rota para obter todos os modelos de máquinas - implementação simplificada
app.get('/api/machine-models', async (req, res) => {
  console.log('Recebida requisição para /api/machine-models');
  try {
    // Consulta simples para obter apenas os campos essenciais
    const query = 'SELECT id, name, family_id FROM machine_models WHERE active = 1 ORDER BY name';
    console.log('Executando query:', query);
    
    const models = await executeQuery(query);
    console.log('Modelos de máquinas encontrados:', models.length);
    
    // Retorna os modelos como JSON
    res.json(models);
  } catch (error) {
    console.error('Erro ao buscar modelos de máquinas:', error);
    res.status(500).json({ error: 'Erro ao buscar modelos de máquinas: ' + error.message });
  }
});

// Rota alternativa para modelos com dados fixos (fallback)
app.get('/api/models-fixed', (req, res) => {
  console.log('Recebida requisição para /api/models-fixed');
  
  // Dados fixos para teste
  const modelos = [
    { id: 1, name: 'CAT 320', family_id: 1 },
    { id: 2, name: 'CAT 336', family_id: 1 },
    { id: 3, name: 'CAT 950', family_id: 2 }
  ];
  
  console.log('Retornando dados fixos de modelos:', modelos.length);
  res.json(modelos);
});



// Rota para listar todos os equipamentos
app.get('/api/equipments', async (req, res) => {
  try {
    const equipments = await executeQuery(
      'SELECT e.*, mm.name as model_name, mf.name as family_name, c.name as client_name ' +
      'FROM equipments e ' +
      'LEFT JOIN machine_models mm ON e.model_id = mm.id ' +
      'LEFT JOIN machine_families mf ON e.family_id = mf.id ' +
      'LEFT JOIN clients c ON e.client_id = c.id ' +
      'WHERE e.active = TRUE'
    );
    
    res.json(equipments);
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar equipamentos',
      error: error.message
    });
  }
});

// Rota para buscar um equipamento específico
app.get('/api/equipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const equipments = await executeQuery(
      'SELECT e.*, mm.name as model_name, mf.name as family_name, c.name as client_name ' +
      'FROM equipments e ' +
      'LEFT JOIN machine_models mm ON e.model_id = mm.id ' +
      'LEFT JOIN machine_families mf ON e.family_id = mf.id ' +
      'LEFT JOIN clients c ON e.client_id = c.id ' +
      'WHERE e.id = ? AND e.active = TRUE',
      [id]
    );
    
    if (equipments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Equipamento não encontrado' 
      });
    }
    
    res.json(equipments[0]);
  } catch (error) {
    console.error(`Erro ao buscar equipamento ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar equipamento',
      error: error.message
    });
  }
});

// Rota para criar um novo equipamento
app.post('/api/equipments', async (req, res) => {
  try {
    const { chassis, series, modelId, familyId, year, hourmeter, clientId } = req.body;
    
    if (!chassis || !modelId || !familyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Os campos Chassi, Modelo e Família são obrigatórios' 
      });
    }
    
    const result = await executeQuery(
      'INSERT INTO equipments (chassis, series, model_id, family_id, year, hourmeter, client_id, active, created_at, updated_at) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())',
      [chassis, series, modelId, familyId, year, hourmeter, clientId]
    );
    
    const newEquipment = await executeQuery(
      'SELECT e.*, mm.name as model_name, mf.name as family_name, c.name as client_name ' +
      'FROM equipments e ' +
      'LEFT JOIN machine_models mm ON e.model_id = mm.id ' +
      'LEFT JOIN machine_families mf ON e.family_id = mf.id ' +
      'LEFT JOIN clients c ON e.client_id = c.id ' +
      'WHERE e.id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Equipamento criado com sucesso',
      equipment: newEquipment[0]
    });
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar equipamento',
      error: error.message
    });
  }
});

// Rota para atualizar um equipamento
app.put('/api/equipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { chassis, series, modelId, familyId, year, hourmeter, clientId } = req.body;
    
    if (!chassis || !modelId || !familyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Os campos Chassi, Modelo e Família são obrigatórios' 
      });
    }
    
    // Verifica se o equipamento existe
    const equipments = await executeQuery(
      'SELECT id FROM equipments WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (equipments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Equipamento não encontrado' 
      });
    }
    
    const result = await executeQuery(
      'UPDATE equipments SET chassis = ?, series = ?, model_id = ?, family_id = ?, year = ?, hourmeter = ?, client_id = ?, updated_at = NOW() WHERE id = ?',
      [chassis, series, modelId, familyId, year, hourmeter, clientId, id]
    );
    
    const updatedEquipment = await executeQuery(
      'SELECT e.*, mm.name as model_name, mf.name as family_name, c.name as client_name ' +
      'FROM equipments e ' +
      'LEFT JOIN machine_models mm ON e.model_id = mm.id ' +
      'LEFT JOIN machine_families mf ON e.family_id = mf.id ' +
      'LEFT JOIN clients c ON e.client_id = c.id ' +
      'WHERE e.id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Equipamento atualizado com sucesso',
      equipment: updatedEquipment[0]
    });
  } catch (error) {
    console.error(`Erro ao atualizar equipamento ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar equipamento',
      error: error.message
    });
  }
});

// Rota para excluir um equipamento (exclusão lógica)
app.delete('/api/equipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o equipamento existe
    const equipments = await executeQuery(
      'SELECT id FROM equipments WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (equipments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Equipamento não encontrado' 
      });
    }
    
    await executeQuery(
      'UPDATE equipments SET active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Equipamento excluído com sucesso'
    });
  } catch (error) {
    console.error(`Erro ao excluir equipamento ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir equipamento',
      error: error.message
    });
  }
});

// Inicializa o servidor
app.listen(port, async () => {
  console.log(`Servidor API novo rodando na porta ${port}`);
  console.log(`Acesse: http://localhost:${port}/api/status`);
  
  // Inicializa as tabelas do banco de dados
  await initializeTables();
});

module.exports = app;
