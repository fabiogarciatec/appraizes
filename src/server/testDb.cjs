// testDb.cjs
// Script simples para testar a conexão com o banco de dados MySQL

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

async function testDatabaseConnection() {
  console.log('Testando conexão com o banco de dados...');
  
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
    console.log('Executando consulta de teste...');
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('Resultado da consulta:', rows);
    
    // Verifica se o banco de dados existe
    console.log('Verificando se o banco de dados existe...');
    const [databases] = await pool.query('SHOW DATABASES');
    console.log('Bancos de dados disponíveis:', databases);
    
    // Verifica as tabelas existentes
    console.log('Verificando tabelas existentes...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tabelas existentes:', tables);
    
    // Encerra o pool de conexões
    await pool.end();
    
    console.log('Teste concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com o banco de dados:', error);
    return false;
  }
}

// Executa o teste
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('Conexão com o banco de dados estabelecida com sucesso!');
    } else {
      console.log('Falha ao conectar com o banco de dados.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro não tratado:', error);
    process.exit(1);
  });
