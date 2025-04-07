// DatabaseService.js
// Serviço para interagir com o banco de dados
// Implementa todas as operações CRUD para as entidades do sistema

import dbManager from '../utils/DatabaseManager.js';

// Classe para gerenciar as operações de banco de dados
class DatabaseService {
  constructor() {
    this.db = dbManager;
  }

  // Inicializa o serviço de banco de dados
  async initialize() {
    await this.db.initialize();
  }

  // ======= OPERAÇÕES DE USUÁRIOS =======
  
  // Busca um usuário pelo nome de usuário e senha
  async authenticateUser(username, password) {
    const sql = 'SELECT id, username, name, email, role FROM users WHERE username = ? AND password = ? AND active = TRUE';
    const result = await this.db.query(sql, [username, password]);
    return result[0];
  }

  // Busca todos os usuários ativos
  async getAllUsers() {
    const sql = 'SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE active = TRUE';
    return await this.db.query(sql);
  }

  // Cria um novo usuário
  async createUser(user) {
    const sql = 'INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)';
    const result = await this.db.query(sql, [user.username, user.password, user.name, user.email, user.role]);
    return { id: result.insertId, ...user };
  }

  // Atualiza um usuário existente
  async updateUser(id, user) {
    let sql = 'UPDATE users SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP';
    let params = [user.name, user.email, user.role];
    
    // Atualiza a senha apenas se fornecida
    if (user.password) {
      sql += ', password = ?';
      params.push(user.password);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);
    
    await this.db.query(sql, params);
    return { id, ...user };
  }

  // Remove um usuário (soft delete)
  async deleteUser(id) {
    const sql = 'UPDATE users SET active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await this.db.query(sql, [id]);
    return { success: true };
  }

  // ======= OPERAÇÕES DE CLIENTES =======
  
  // Busca todos os clientes ativos
  async getAllClients() {
    const sql = 'SELECT * FROM clients WHERE active = TRUE';
    return await this.db.query(sql);
  }

  // Busca um cliente pelo ID
  async getClientById(id) {
    const sql = 'SELECT * FROM clients WHERE id = ? AND active = TRUE';
    const result = await this.db.query(sql, [id]);
    return result[0];
  }

  // Cria um novo cliente
  async createClient(client) {
    const sql = `
      INSERT INTO clients 
      (name, contact, phone, email, cpf_cnpj, rg_insc_est, insc_munic, address, city, state, zip_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await this.db.query(sql, [
      client.name, client.contact, client.phone, client.email, 
      client.cpf_cnpj, client.rg_insc_est, client.insc_munic,
      client.address, client.city, client.state, client.zip_code
    ]);
    return { id: result.insertId, ...client };
  }

  // Atualiza um cliente existente
  async updateClient(id, client) {
    const sql = `
      UPDATE clients 
      SET name = ?, contact = ?, phone = ?, email = ?, 
          cpf_cnpj = ?, rg_insc_est = ?, insc_munic = ?,
          address = ?, city = ?, state = ?, zip_code = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await this.db.query(sql, [
      client.name, client.contact, client.phone, client.email, 
      client.cpf_cnpj, client.rg_insc_est, client.insc_munic,
      client.address, client.city, client.state, client.zip_code,
      id
    ]);
    return { id, ...client };
  }

  // Remove um cliente (soft delete)
  async deleteClient(id) {
    const sql = 'UPDATE clients SET active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await this.db.query(sql, [id]);
    return { success: true };
  }

  // Adiciona um registro ao histórico do cliente
  async addClientHistory(clientId, userId, description) {
    const sql = 'INSERT INTO client_history (client_id, user_id, date, description) VALUES (?, ?, NOW(), ?)';
    const result = await this.db.query(sql, [clientId, userId, description]);
    return { id: result.insertId, clientId, userId, description };
  }

  // Busca o histórico de um cliente
  async getClientHistory(clientId) {
    const sql = `
      SELECT ch.*, u.name as user_name 
      FROM client_history ch
      JOIN users u ON ch.user_id = u.id
      WHERE ch.client_id = ?
      ORDER BY ch.date DESC
    `;
    return await this.db.query(sql, [clientId]);
  }

  // ======= OPERAÇÕES DE EQUIPAMENTOS =======
  
  // Busca todos os equipamentos
  async getAllEquipments() {
    const sql = `
      SELECT e.*, c.name as client_name, mm.name as model_name, mf.name as family_name
      FROM equipments e
      JOIN clients c ON e.client_id = c.id
      JOIN machine_models mm ON e.model_id = mm.id
      JOIN machine_families mf ON e.family_id = mf.id
      WHERE e.active = TRUE
    `;
    return await this.db.query(sql);
  }

  // Busca equipamentos de um cliente específico
  async getEquipmentsByClient(clientId) {
    const sql = `
      SELECT e.*, mm.name as model_name, mf.name as family_name
      FROM equipments e
      JOIN machine_models mm ON e.model_id = mm.id
      JOIN machine_families mf ON e.family_id = mf.id
      WHERE e.client_id = ? AND e.active = TRUE
    `;
    return await this.db.query(sql, [clientId]);
  }

  // Cria um novo equipamento
  async createEquipment(equipment) {
    const sql = `
      INSERT INTO equipments 
      (chassis, series, model_id, family_id, year, hourmeter, client_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await this.db.query(sql, [
      equipment.chassis, equipment.series, equipment.model_id,
      equipment.family_id, equipment.year, equipment.hourmeter,
      equipment.client_id
    ]);
    return { id: result.insertId, ...equipment };
  }

  // Atualiza um equipamento existente
  async updateEquipment(id, equipment) {
    const sql = `
      UPDATE equipments 
      SET chassis = ?, series = ?, model_id = ?, family_id = ?, 
          year = ?, hourmeter = ?, client_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await this.db.query(sql, [
      equipment.chassis, equipment.series, equipment.model_id,
      equipment.family_id, equipment.year, equipment.hourmeter,
      equipment.client_id, id
    ]);
    return { id, ...equipment };
  }

  // Remove um equipamento (soft delete)
  async deleteEquipment(id) {
    const sql = 'UPDATE equipments SET active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await this.db.query(sql, [id]);
    return { success: true };
  }

  // ======= OPERAÇÕES DE ABASTECIMENTOS =======
  
  // Busca abastecimentos de um equipamento específico
  async getFuelRefillsByEquipment(equipmentId) {
    const sql = 'SELECT * FROM fuel_refills WHERE equipment_id = ? ORDER BY date DESC';
    return await this.db.query(sql, [equipmentId]);
  }

  // Cria um novo registro de abastecimento
  async createFuelRefill(refill) {
    const sql = `
      INSERT INTO fuel_refills 
      (equipment_id, date, liters, hourmeter, used_adgreen, operator_name, operator_phone, fuel_price, total_cost, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await this.db.query(sql, [
      refill.equipment_id, refill.date, refill.liters, refill.hourmeter,
      refill.used_adgreen, refill.operator_name, refill.operator_phone,
      refill.fuel_price, refill.total_cost, refill.notes
    ]);
    return { id: result.insertId, ...refill };
  }

  // ======= OPERAÇÕES DE PEÇAS =======
  
  // Busca todas as peças oficiais
  async getAllOfficialParts() {
    const sql = `
      SELECT op.*, pc.name as category_name
      FROM official_parts op
      JOIN part_categories pc ON op.category_id = pc.id
      WHERE op.active = TRUE
    `;
    return await this.db.query(sql);
  }

  // Busca nomes populares de uma peça oficial
  async getPopularNamesByPartId(partId) {
    const sql = 'SELECT * FROM popular_names WHERE official_part_id = ?';
    return await this.db.query(sql, [partId]);
  }

  // Cria uma nova peça oficial
  async createOfficialPart(part) {
    const sql = `
      INSERT INTO official_parts 
      (official_name, manufacturer_ref, category_id, description) 
      VALUES (?, ?, ?, ?)
    `;
    const result = await this.db.query(sql, [
      part.official_name, part.manufacturer_ref, 
      part.category_id, part.description
    ]);
    return { id: result.insertId, ...part };
  }

  // Adiciona um nome popular a uma peça
  async addPopularName(popularName) {
    const sql = 'INSERT INTO popular_names (popular_name, official_part_id) VALUES (?, ?)';
    const result = await this.db.query(sql, [popularName.popular_name, popularName.official_part_id]);
    return { id: result.insertId, ...popularName };
  }

  // ======= OPERAÇÕES DE SOLICITAÇÕES DE ORÇAMENTO =======
  
  // Busca todas as solicitações de orçamento
  async getAllQuoteRequests() {
    const sql = `
      SELECT qr.*, c.name as client_name, u.name as consultant_name
      FROM quote_requests qr
      JOIN clients c ON qr.client_id = c.id
      JOIN users u ON qr.consultant_id = u.id
      ORDER BY qr.date DESC
    `;
    return await this.db.query(sql);
  }

  // Cria uma nova solicitação de orçamento
  async createQuoteRequest(request) {
    const sql = `
      INSERT INTO quote_requests 
      (client_id, consultant_id, date, status, popular_part_name, 
       machine_model, machine_series, machine_chassis, machine_year, 
       machine_family, observations) 
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await this.db.query(sql, [
      request.client_id, request.consultant_id, request.status,
      request.popular_part_name, request.machine_model, request.machine_series,
      request.machine_chassis, request.machine_year, request.machine_family,
      request.observations
    ]);
    return { id: result.insertId, ...request };
  }

  // Atualiza o status de uma solicitação de orçamento
  async updateQuoteRequestStatus(id, status, identifiedPartId = null) {
    let sql = 'UPDATE quote_requests SET status = ?';
    let params = [status];
    
    if (identifiedPartId) {
      sql += ', identified_part_id = ?';
      params.push(identifiedPartId);
    }
    
    if (status === 'quoted') {
      sql += ', quoted_date = NOW()';
    } else if (status === 'completed') {
      sql += ', completed_date = NOW()';
    }
    
    sql += ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params.push(id);
    
    await this.db.query(sql, params);
    return { id, status, identifiedPartId };
  }
}

// Exporta uma instância única do DatabaseService
const dbService = new DatabaseService();
export default dbService;
