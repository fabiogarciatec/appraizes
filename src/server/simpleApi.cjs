// simpleApi.cjs
// Servidor Express simples para fornecer uma API que se conecta ao banco de dados MySQL

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

// Inicialização do servidor
const app = express();
const port = process.env.SIMPLE_API_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Rota para verificar o status da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar a conexão com o banco de dados
app.get('/api/database/test', async (req, res) => {
  try {
    // Configuração do pool de conexões
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
    
    // Testa a conexão
    const [rows] = await pool.query('SELECT 1 as test');
    
    // Verifica os bancos de dados disponíveis
    const [databases] = await pool.query('SHOW DATABASES');
    const databaseList = databases.map(db => db.Database);
    
    // Verifica as tabelas existentes
    const [tables] = await pool.query('SHOW TABLES');
    const tableColumn = `Tables_in_${process.env.DB_NAME}`;
    const tableList = tables.map(table => table[tableColumn]);
    
    // Encerra o pool de conexões
    await pool.end();
    
    // Retorna informações detalhadas
    res.json({
      success: true,
      message: `Conexão com o banco de dados '${process.env.DB_NAME}' estabelecida com sucesso`,
      database: process.env.DB_NAME,
      tables: tableList,
      databases: databaseList
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

// Rota para listar usuários
app.get('/api/users', async (req, res) => {
  try {
    // Configuração do pool de conexões
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
    
    // Busca os usuários
    const [users] = await pool.query(
      'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE active = TRUE'
    );
    
    // Encerra o pool de conexões
    await pool.end();
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Rota para listar clientes
app.get('/api/clients', async (req, res) => {
  try {
    // Configuração do pool de conexões
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
    
    // Busca os clientes
    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE active = TRUE'
    );
    
    // Encerra o pool de conexões
    await pool.end();
    
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor API simples rodando na porta ${port}`);
  console.log(`Acesse: http://localhost:${port}/api/status`);
});

module.exports = app;
