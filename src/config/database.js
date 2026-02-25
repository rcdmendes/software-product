// src/config/database.js
const sql = require('mssql');
require('dotenv').config();

/* ===========================
   VALIDAÇÃO DE VARIÁVEIS
=========================== */
const requiredEnvVars = ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não definidas:', missingVars);
  process.exit(1);
}

/* ===========================
   CONFIGURAÇÃO DO POOL
=========================== */
const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  pool: {
    max: 10,              // máximo de conexões simultâneas
    min: 2,               // mínimo mantido em standby
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 60000,
    requestTimeout: 30000,
    enableArithAbort: true,
  },
};

/* ===========================
   GERENCIAMENTO DO POOL
=========================== */
let globalPool = null;

const getPool = async () => {
  try {
    if (!globalPool) {
      console.log('🔌 Criando pool de conexões com SQL Server...');
      globalPool = await sql.connect(config);

      globalPool.on('error', (err) => {
        console.error('❌ Erro na conexão SQL Server:', err);
        globalPool = null;
      });

      console.log('✅ Pool de conexões SQL Server criado com sucesso');
    }
    return globalPool;
  } catch (error) {
    console.error('❌ Erro ao criar pool de conexões:', error);
    globalPool = null;
    throw error;
  }
};

/* ===========================
   UTILITÁRIOS
=========================== */
const testConnection = async () => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 as test');
    console.log('✅ Teste de conectividade SQL Server: OK');
    return true;
  } catch (error) {
    console.error('❌ Teste de conectividade SQL Server: FALHOU');
    return false;
  }
};

const closePool = async () => {
  if (globalPool) {
    await globalPool.close();
    globalPool = null;
  }
};

module.exports = { config, getPool, testConnection, closePool, sql };