// updateAdminPassword.cjs
// Script para atualizar a senha do usuário admin diretamente no banco de dados

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

async function updateAdminPassword() {
  console.log('Atualizando senha do usuário admin...');
  
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
    
    // Nova senha para o usuário admin
    const newPassword = 'admin123';
    
    // Atualiza a senha do usuário admin
    console.log('Executando atualização da senha...');
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE username = ? AND id = 1',
      [newPassword, 'admin']
    );
    
    if (result.affectedRows > 0) {
      console.log(`Senha do usuário admin atualizada com sucesso para: ${newPassword}`);
    } else {
      console.log('Nenhum usuário admin encontrado para atualizar a senha.');
    }
    
    // Encerra o pool de conexões
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar senha do usuário admin:', error);
    return false;
  }
}

// Executa a atualização da senha
updateAdminPassword()
  .then(success => {
    if (success) {
      console.log('Operação concluída com sucesso!');
    } else {
      console.log('Falha na operação.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro não tratado:', error);
    process.exit(1);
  });
