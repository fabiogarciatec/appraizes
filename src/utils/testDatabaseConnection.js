// testDatabaseConnection.js
// Script para testar a conexão com o banco de dados MySQL
// Verifica se a conexão pode ser estabelecida e se o banco de dados está acessível

import dbManager from './DatabaseManager.js';

// Função assíncrona para testar a conexão com o banco de dados
async function testDatabaseConnection() {
  try {
    console.log('Iniciando teste de conexão com o banco de dados...');
    console.log(`Tentando conectar a ${process.env.DB_HOST}:${process.env.DB_PORT} como ${process.env.DB_USER}`);
    
    // Inicializa o gerenciador de banco de dados
    await dbManager.initialize();
    
    // Testa uma query simples
    const result = await dbManager.query('SELECT 1 + 1 AS sum');
    console.log('Conexão estabelecida com sucesso!');
    console.log('Resultado do teste:', result[0].sum);
    
    // Verifica se o banco de dados existe
    const databases = await dbManager.query(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [process.env.DB_NAME]
    );
    
    if (databases.length > 0) {
      console.log(`Banco de dados '${process.env.DB_NAME}' encontrado.`);
      
      // Verifica as tabelas existentes
      const tables = await dbManager.query(
        'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
        [process.env.DB_NAME]
      );
      
      console.log(`Tabelas encontradas (${tables.length}):`);
      for (const table of tables) {
        console.log(`- ${table.TABLE_NAME}`);
      }
    } else {
      console.log(`Banco de dados '${process.env.DB_NAME}' não encontrado.`);
      console.log('Execute "npm run setup-db" para criar o banco de dados e as tabelas.');
    }
    
    // Exibe estatísticas de conexão
    const stats = dbManager.getStats();
    console.log('Estatísticas de conexão:', stats);
    
    // Encerra a conexão com o banco de dados
    await dbManager.end();
    
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com o banco de dados:', error);
    return false;
  }
}

// Executa o teste de conexão
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('Teste de conexão concluído com sucesso');
      process.exit(0);
    } else {
      console.error('Falha no teste de conexão');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro fatal durante o teste:', error);
    process.exit(1);
  });
