// Utilitário para logging da API
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'api.log');

// Função para limpar o arquivo de log
const clearLog = () => {
  try {
    fs.writeFileSync(logFilePath, '', 'utf8');
    console.log('Arquivo de log limpo');
  } catch (error) {
    console.error('Erro ao limpar arquivo de log:', error);
  }
};

// Função para adicionar uma entrada ao log
const logToFile = (message) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (error) {
    console.error('Erro ao escrever no arquivo de log:', error);
  }
};

// Middleware para logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, headers, body } = req;
  
  // Log da requisição
  logToFile(`Requisição: ${method} ${url}`);
  logToFile(`Headers: ${JSON.stringify(headers)}`);
  
  if (body && Object.keys(body).length > 0) {
    logToFile(`Body: ${JSON.stringify(body)}`);
  }
  
  // Intercepta o método res.send para logar a resposta
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - start;
    logToFile(`Resposta: ${res.statusCode} (${responseTime}ms)`);
    
    try {
      // Tenta logar o corpo da resposta se for JSON
      if (typeof data === 'string' && data.startsWith('{')) {
        logToFile(`Corpo da resposta: ${data.substring(0, 200)}...`);
      } else if (typeof data === 'object') {
        logToFile(`Corpo da resposta: ${JSON.stringify(data).substring(0, 200)}...`);
      }
    } catch (error) {
      logToFile(`Erro ao logar corpo da resposta: ${error.message}`);
    }
    
    originalSend.apply(res, arguments);
  };
  
  next();
};

// Exporta as funções
module.exports = {
  clearLog,
  logToFile,
  requestLogger
};
