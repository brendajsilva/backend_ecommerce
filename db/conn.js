require('dotenv').config()
const { Sequelize } = require('sequelize')

function getConnectionConfig() {
  
  // --- DEBUG NO RAILWAY ---
  // Isso vai imprimir no log quais variáveis o Node está enxergando.
  // (Segurança: mostra apenas se está "DEFINIDO" ou "undefined", não mostra a senha)
  console.log("--- DIAGNÓSTICO DE AMBIENTE ---");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "DEFINIDO" : "undefined");
  
  console.log("MYSQL (Railway):");
  console.log(" - MYSQLDATABASE:", process.env.MYSQLDATABASE ? "DEFINIDO" : "undefined");
  console.log(" - MYSQLUSER:", process.env.MYSQLUSER ? "DEFINIDO" : "undefined");
  console.log(" - MYSQLPASSWORD:", process.env.MYSQLPASSWORD ? "DEFINIDO" : "undefined");
  
  console.log("LEGACY (.env):");
  console.log(" - DB_NAME:", process.env.DB_NAME ? "DEFINIDO" : "undefined");
  console.log(" - DB_USER:", process.env.DB_USER ? "DEFINIDO" : "undefined");
  console.log("--------------------------------");
  // ------------------------

  // 1) if DATABASE_URL provedor
  if (process.env.DATABASE_URL) {
    return { uri: process.env.DATABASE_URL, options: { dialect: 'mysql', dialectOptions: {} } }
  }

  // 2) try Railway-like MYSQL_* env vars
  // ATENÇÃO: Se faltar UM desses três, ele pula este bloco!
  if (process.env.MYSQLDATABASE && process.env.MYSQLUSER && process.env.MYSQLPASSWORD) {
    const db = process.env.MYSQLDATABASE
    const user = process.env.MYSQLUSER
    const pass = process.env.MYSQLPASSWORD
    const host = process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST
    const port = process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT
    
    // Fallback se não achar host
    if (!host) console.warn("AVISO: Nenhum HOST encontrado para MYSQL (MYSQLHOST/DB_HOST)");

    const uri = `mysql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${db}`
    return { uri, options: { dialect: 'mysql', dialectOptions: {} } }
  }

  // 3) fallback to legacy DB_* vars (your .env)
  // ATENÇÃO: Se faltar UM desses dois, ele pula este bloco!
  if (process.env.DB_NAME && process.env.DB_USER) {
    const db = process.env.DB_NAME
    const user = process.env.DB_USER
    const pass = process.env.DB_PASS || 'senai'
    const host = process.env.DB_HOST || 'localhost'
    const port = process.env.DB_PORT || 3306
    const uri = `mysql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${db}`
    return { uri, options: { dialect: 'mysql', dialectOptions: {} } }
  }

  // 4) não encontrado -> lança erro
  // Agora sabemos o motivo porque vimos os logs acima
  throw new Error('Nenhuma configuração de DB encontrada. Verifique os logs de "DIAGNÓSTICO" acima.')
}

const { uri, options } = getConnectionConfig()

const sequelize = new Sequelize(uri, options)

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Conexão com o banco realizada com sucesso!')
  } catch (err) {
    console.error('Erro ao conectar com banco de dados!', err)
  }
}
testConnection()

module.exports = sequelize