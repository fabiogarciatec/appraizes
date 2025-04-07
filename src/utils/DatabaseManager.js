// DatabaseManager.js
// Gerenciador de conexão com o banco de dados MySQL
// Implementa pool de conexões, timeout para queries, monitoramento de estatísticas
// e suporte a keepAlive para manter conexões estáveis

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

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
    this.defaultTimeout = 30000; // 30 segundos de timeout padrão
  }

  // Inicialização assíncrona do pool de conexões
  async initialize() {
    if (this.isInitialized) {
      console.log('DatabaseManager já está inicializado');
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
        keepAliveInitialDelay: 10000, // 10 segundos
        timezone: '-03:00', // Timezone para Brasil
        charset: 'utf8mb4',
        connectTimeout: 10000, // 10 segundos para timeout de conexão
        supportBigNumbers: true,
        bigNumberStrings: true,
        dateStrings: true,
        multipleStatements: false // Por segurança, desabilitamos múltiplas queries
      });

      // Testa a conexão
      const connection = await this.pool.getConnection();
      console.log('Conexão com o banco de dados estabelecida com sucesso');
      connection.release();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      this.stats.connectionErrors++;
      this.stats.lastError = error.message;
      this.stats.lastErrorTime = new Date();
      console.error('Erro ao inicializar o DatabaseManager:', error);
      throw error;
    }
  }

  // Executa uma query com timeout
  async query(sql, params = [], timeout = this.defaultTimeout) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    this.stats.totalQueries++;

    try {
      // Implementação de timeout para a query
      const queryPromise = this.pool.query(sql, params);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Query timeout após ${timeout}ms: ${sql}`));
        }, timeout);
      });

      // Executa a query com timeout
      const [result] = await Promise.race([queryPromise, timeoutPromise]);
      
      // Atualiza estatísticas
      const queryTime = Date.now() - startTime;
      this.stats.successfulQueries++;
      this.stats.lastQueryTime = queryTime;
      this.stats.totalQueryTime += queryTime;
      this.stats.averageQueryTime = this.stats.totalQueryTime / this.stats.successfulQueries;
      
      return result;
    } catch (error) {
      // Atualiza estatísticas de erro
      this.stats.failedQueries++;
      this.stats.lastError = error.message;
      this.stats.lastErrorTime = new Date();
      
      console.error('Erro na execução da query:', error);
      console.error('SQL:', sql);
      console.error('Parâmetros:', params);
      
      throw error;
    }
  }

  // Executa uma transação com múltiplas queries
  async transaction(callback) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Cria a tabela de clientes com campos unificados
  async createClientsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        cpf_cnpj VARCHAR(20) UNIQUE,
        rg_insc_est VARCHAR(20),
        insc_munic VARCHAR(20),
        address VARCHAR(255),
        city VARCHAR(100),
        state CHAR(2),
        zip_code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT TRUE
      )
    `;
    return this.query(sql);
  }

  // Retorna estatísticas de conexão
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

  // Verifica se o banco de dados existe e cria se necessário
  async ensureDatabase() {
    try {
      // Cria um pool temporário sem especificar o banco de dados
      const tempPool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0
      });

      // Verifica se o banco de dados existe
      const [rows] = await tempPool.query(
        'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
        [process.env.DB_NAME]
      );

      // Se o banco de dados não existir, cria
      if (rows.length === 0) {
        console.log(`Banco de dados ${process.env.DB_NAME} não encontrado. Criando...`);
        await tempPool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} 
                             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Banco de dados ${process.env.DB_NAME} criado com sucesso`);
      } else {
        console.log(`Banco de dados ${process.env.DB_NAME} já existe`);
      }

      // Encerra o pool temporário
      await tempPool.end();
      return true;
    } catch (error) {
      console.error('Erro ao verificar/criar banco de dados:', error);
      throw error;
    }
  }

  // Executa o script SQL completo para criar todas as tabelas
  async executeFullScript(scriptSQL) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Divide o script em comandos individuais
    const commands = scriptSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    try {
      for (const command of commands) {
        await this.query(command);
      }
      console.log('Script SQL executado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao executar script SQL:', error);
      throw error;
    }
  }
}

// Exporta uma instância única do DatabaseManager
const dbManager = new DatabaseManager();
export default dbManager;
