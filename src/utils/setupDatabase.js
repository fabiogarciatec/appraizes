// setupDatabase.js
// Script para configurar o banco de dados do Appraizes
// Executa o script SQL completo para criar todas as tabelas necessárias

import dbManager from './DatabaseManager.js';

// Script SQL completo para criação do banco de dados
const fullDatabaseScript = `
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('admin', 'consultor') NOT NULL DEFAULT 'consultor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Tabela de clientes
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
);

-- Tabela de famílias de máquinas
CREATE TABLE IF NOT EXISTS machine_families (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Tabela de modelos de máquinas
CREATE TABLE IF NOT EXISTS machine_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    family_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (family_id) REFERENCES machine_families(id),
    UNIQUE KEY (name, family_id)
);

-- Tabela de equipamentos (máquinas dos clientes)
CREATE TABLE IF NOT EXISTS equipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chassis VARCHAR(50) NOT NULL UNIQUE,
    series VARCHAR(50),
    model_id INT NOT NULL,
    family_id INT NOT NULL,
    year INT,
    hourmeter INT DEFAULT 0,
    client_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (model_id) REFERENCES machine_models(id),
    FOREIGN KEY (family_id) REFERENCES machine_families(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Tabela de categorias de peças
CREATE TABLE IF NOT EXISTS part_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Tabela de peças oficiais
CREATE TABLE IF NOT EXISTS official_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    official_name VARCHAR(255) NOT NULL,
    manufacturer_ref VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES part_categories(id),
    UNIQUE KEY (manufacturer_ref)
);

-- Tabela de compatibilidade entre peças e modelos de máquinas
CREATE TABLE IF NOT EXISTS part_compatibility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT NOT NULL,
    model_id INT NOT NULL,
    start_year INT,
    end_year INT,
    start_chassis VARCHAR(50),
    end_chassis VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES official_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES machine_models(id),
    UNIQUE KEY (part_id, model_id, start_year, end_year)
);

-- Tabela de nomes populares (dicionário)
CREATE TABLE IF NOT EXISTS popular_names (
    id INT AUTO_INCREMENT PRIMARY KEY,
    popular_name VARCHAR(255) NOT NULL,
    official_part_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (official_part_id) REFERENCES official_parts(id) ON DELETE CASCADE,
    UNIQUE KEY (popular_name, official_part_id)
);

-- Tabela de solicitações de orçamento
CREATE TABLE IF NOT EXISTS quote_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    consultant_id INT NOT NULL,
    date DATETIME NOT NULL,
    status ENUM('pending', 'identified', 'quoted', 'completed') NOT NULL DEFAULT 'pending',
    popular_part_name VARCHAR(255) NOT NULL,
    machine_model VARCHAR(100),
    machine_series VARCHAR(100),
    machine_chassis VARCHAR(100),
    machine_year INT,
    machine_family VARCHAR(100),
    observations TEXT,
    identified_part_id INT,
    quoted_price DECIMAL(10, 2),
    quoted_date DATETIME,
    completed_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (consultant_id) REFERENCES users(id),
    FOREIGN KEY (identified_part_id) REFERENCES official_parts(id)
);

-- Tabela de abastecimentos de combustível
CREATE TABLE IF NOT EXISTS fuel_refills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    date DATE NOT NULL,
    liters DECIMAL(10, 2) NOT NULL,
    hourmeter INT NOT NULL,
    used_adgreen BOOLEAN DEFAULT FALSE,
    operator_name VARCHAR(100),
    operator_phone VARCHAR(20),
    fuel_price DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipments(id)
);

-- Tabela para histórico de clientes
CREATE TABLE IF NOT EXISTS client_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    date DATETIME NOT NULL,
    description TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices adicionais para otimização de consultas serão criados por procedimentos separados
-- para evitar erros de duplicação

-- Inserção de dados iniciais para administrador
INSERT INTO users (username, password, name, email, role) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@appraizes.com', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Inserção de dados iniciais para categorias de peças
INSERT INTO part_categories (name) VALUES 
('Filtro'),
('Bomba'),
('Mangueira'),
('Motor'),
('Transmissão'),
('Sistema Hidráulico'),
('Sistema Elétrico'),
('Chassi'),
('Cabine'),
('Outros')
ON DUPLICATE KEY UPDATE name = name;

-- Inserção de dados iniciais para famílias de máquinas
INSERT INTO machine_families (name) VALUES 
('Escavadeiras'),
('Carregadeiras'),
('Tratores'),
('Motoniveladoras'),
('Retroescavadeiras')
ON DUPLICATE KEY UPDATE name = name;
`;

// Função assíncrona para configurar o banco de dados
async function setupDatabase() {
  try {
    console.log('Iniciando configuração do banco de dados...');
    
    // Verifica se o banco de dados existe e cria se necessário
    await dbManager.ensureDatabase();
    
    // Inicializa o gerenciador de banco de dados
    await dbManager.initialize();
    
    // Executa o script SQL completo
    await dbManager.executeFullScript(fullDatabaseScript);
    
    console.log('Banco de dados configurado com sucesso!');
    
    // Encerra a conexão com o banco de dados
    await dbManager.end();
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
    return false;
  }
}

// Executa a configuração do banco de dados
setupDatabase()
  .then(success => {
    if (success) {
      console.log('Processo de configuração concluído com sucesso');
      process.exit(0);
    } else {
      console.error('Falha no processo de configuração');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro fatal durante a configuração:', error);
    process.exit(1);
  });
